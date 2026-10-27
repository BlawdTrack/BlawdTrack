import groovy.json.JsonOutput
import groovy.json.JsonSlurper

import java.io.IOException
import java.net.ConnectException
import java.net.ProtocolException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.net.http.HttpTimeoutException
import java.time.Duration

final String apiBaseUrl = (System.getenv('BLAWDTRACK_API_URL') ?: 'http://localhost:8080').replaceAll('/+$', '')
final String superUserEmail = System.getenv('BLAWDTRACK_SUPER_USER_EMAIL')
final String superUserPassword = System.getenv('BLAWDTRACK_SUPER_USER_PASSWORD')
final String administratorEmail = 'carlos.actualizado.katalon@example.com'
final String administratorPassword = System.getenv('BLAWDTRACK_ADMIN_NEW_PASSWORD')
final String documentType = 'CEDULA'
final String documentNumber = '123456789'

assert superUserEmail?.trim() :
    'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() :
    'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'
assert administratorPassword?.trim() :
    'BLAWDTRACK_ADMIN_NEW_PASSWORD no está configurada en el entorno de ejecución.'

final JsonSlurper jsonSlurper = new JsonSlurper()
final Duration connectionTimeout = Duration.ofSeconds(10)
final Duration requestTimeout = Duration.ofSeconds(15)

final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(connectionTimeout)
    .followRedirects(HttpClient.Redirect.NEVER)
    .build()

String carlosJwt = null
String superUserJwt = null
Throwable primaryFailure = null
boolean deactivationPatchAttempted = false

final def failureCategory = { Throwable failure ->
    if (failure instanceof HttpTimeoutException) {
        return 'TIMEOUT'
    }
    if (failure instanceof ConnectException) {
        return 'CONNECTION_UNAVAILABLE'
    }
    if (failure instanceof ProtocolException) {
        return 'HTTP_PROTOCOL'
    }
    if (failure instanceof IllegalArgumentException) {
        return 'INVALID_URI_OR_REQUEST'
    }
    if (failure instanceof IOException) {
        return 'IO_TRANSPORT'
    }
    if (failure instanceof InterruptedException) {
        return 'INTERRUPTED'
    }
    return 'UNEXPECTED_TRANSPORT'
}

final def sanitizedTransportFailure = {
    String method,
    String path,
    Throwable failure ->

    if (failure instanceof InterruptedException) {
        Thread.currentThread().interrupt()
    }

    final String category = failureCategory(failure)
    return new AssertionError(
        "Solicitud ${method} ${path} falló; categoría=${category}; tipo=${failure.class.name}."
    )
}

final def normalizedDocumentNumber = { Object value ->
    return value == null ? '' : value.toString().replaceAll(/\D/, '')
}

/*
 * The closure is intentionally non-final because it recursively references
 * itself. This avoids Groovy's final-variable reassignment compilation error.
 */
def collectMaps
collectMaps = { Object value, List<Map> results ->
    if (value instanceof Map) {
        results.add(value as Map)
        value.values().each { nestedValue ->
            collectMaps(nestedValue, results)
        }
    } else if (value instanceof List) {
        value.each { nestedValue ->
            collectMaps(nestedValue, results)
        }
    }
}

/*
 * Converts the administrator-list payload into only the fields needed by the
 * precondition. The complete list is not returned from httpRequest.
 */
final def locateAdministratorPayload = { Object payload ->
    final List<Map> candidates = []
    collectMaps(payload, candidates)

    final Map match = candidates.find { Map candidate ->
        final Object candidateEmail = candidate.email
        final Object candidateNumber = candidate.documentNumber

        return candidateEmail instanceof String &&
            candidateEmail == administratorEmail &&
            normalizedDocumentNumber(candidateNumber) ==
                normalizedDocumentNumber(documentNumber)
    }

    if (match == null) {
        return null
    }

    return [
        documentType  : match.documentType,
        documentNumber: normalizedDocumentNumber(match.documentNumber),
        status        : match.status
    ]
}

/*
 * Returns only statusCode and sanitized fields needed by assertions.
 * Request bodies, credentials, JWTs, authorization headers and full responses
 * are never printed, returned or included in assertion messages.
 */
final def httpRequest = {
    String method,
    String path,
    String jwt = null,
    String requestBody = null ->

    try {
        final URI requestUri = URI.create("${apiBaseUrl}${path}")

        final HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(requestUri)
            .timeout(requestTimeout)
            .header('Accept', 'application/json')

        if (requestBody != null) {
            requestBuilder.header(
                'Content-Type',
                'application/json; charset=UTF-8'
            )
        }

        if (jwt != null) {
            requestBuilder.header('Authorization', "Bearer ${jwt}")
        }

        final HttpRequest.BodyPublisher bodyPublisher = requestBody == null
            ? HttpRequest.BodyPublishers.noBody()
            : HttpRequest.BodyPublishers.ofString(
                requestBody,
                java.nio.charset.StandardCharsets.UTF_8
            )

        final HttpRequest request = requestBuilder
            .method(method, bodyPublisher)
            .build()

        final HttpResponse<String> response = httpClient.send(
            request,
            HttpResponse.BodyHandlers.ofString(
                java.nio.charset.StandardCharsets.UTF_8
            )
        )

        final Map parsedFields = [:]
        final String responseText = response.body()

        if (responseText != null && responseText.trim()) {
            final Object parsedPayload

            try {
                parsedPayload = jsonSlurper.parseText(responseText)
            } catch (Throwable ignoredJsonFailure) {
                throw new AssertionError(
                    'El backend devolvió un JSON no válido.'
                )
            }

            if (parsedPayload instanceof Map) {
                if (parsedPayload.containsKey('token')) {
                    parsedFields.token = parsedPayload.token instanceof String
                        ? parsedPayload.token
                        : null
                }
                if (parsedPayload.containsKey('status')) {
                    parsedFields.status = parsedPayload.status
                }
                if (parsedPayload.containsKey('code')) {
                    parsedFields.code = parsedPayload.code
                }
            }

            if (path == '/api/v1/admins') {
                parsedFields.administrator =
                    locateAdministratorPayload(parsedPayload)
            }
        }

        return [
            statusCode   : response.statusCode(),
            token        : parsedFields.token,
            status       : parsedFields.status,
            code         : parsedFields.code,
            administrator: parsedFields.administrator
        ]

    } catch (AssertionError assertionFailure) {
        throw assertionFailure
    } catch (Throwable failure) {
        throw sanitizedTransportFailure(method, path, failure)
    }
}

final def loginBody = { String email, String password ->
    return JsonOutput.toJson([
        email   : email,
        password: password
    ])
}

final def statusBody = { String status ->
    return JsonOutput.toJson([status: status])
}

final def login = { String email, String password ->
    final Map response = httpRequest(
        'POST',
        '/api/v1/auth/login',
        null,
        loginBody(email, password)
    )

    assert response.statusCode == 200 :
        "El login API devolvió HTTP ${response.statusCode}."
    assert response.token instanceof String && response.token.trim() :
        'El login no devolvió el token top-level esperado.'

    return response.token as String
}

final def sessionStatus = { String jwt ->
    return httpRequest(
        'GET',
        '/api/v1/auth/session',
        jwt,
        null
    )
}

final def findAdministratorReadOnly = { String jwt ->
    final Map response = httpRequest(
        'GET',
        '/api/v1/admins',
        jwt,
        null
    )

    assert response.statusCode == 200 :
        "La consulta de administradores devolvió HTTP ${response.statusCode}."
    assert response.administrator != null :
        'No se encontró el administrador esperado en la consulta de solo lectura.'

    return response.administrator
}

final def changeAccessStatus = { String jwt, String status ->
    return httpRequest(
        'PATCH',
        "/api/v1/admins/${documentType}/${documentNumber}",
        jwt,
        statusBody(status)
    )
}

try {
    carlosJwt = login(administratorEmail, administratorPassword)

    final Map initialSession = sessionStatus(carlosJwt)
    assert initialSession.statusCode == 204 :
        "La sesión inicial de Carlos no fue aceptada: HTTP ${initialSession.statusCode}."

    superUserJwt = login(superUserEmail, superUserPassword)

    // Read-only precondition before any status-changing request.
    final Map storedAdministrator = findAdministratorReadOnly(superUserJwt)

    assert storedAdministrator.documentType == documentType :
        'El tipo de documento almacenado no coincide con CEDULA.'
    assert storedAdministrator.documentNumber == documentNumber :
        'El número de documento almacenado no coincide con el esperado.'
    assert storedAdministrator.status == 'ACTIVE' :
        'Carlos no está ACTIVE antes de iniciar la desactivación.'

    // Mark before sending: the backend may apply the PATCH before a transport failure.
    deactivationPatchAttempted = true
    final Map inactiveResponse = changeAccessStatus(superUserJwt, 'INACTIVE')

    assert inactiveResponse.statusCode == 200 :
        "La desactivación de Carlos devolvió HTTP ${inactiveResponse.statusCode}."
    assert inactiveResponse.status == 'INACTIVE' :
        'La respuesta de desactivación no confirma top-level status INACTIVE.'

    final Map revokedSession = sessionStatus(carlosJwt)
    assert revokedSession.statusCode == 401 :
        "El JWT original no fue rechazado después de la desactivación: HTTP ${revokedSession.statusCode}."
    assert revokedSession.code == 'NO_AUTENTICADO' :
        'La respuesta de la sesión revocada no contiene NO_AUTENTICADO.'

    final Map inactiveLogin = httpRequest(
        'POST',
        '/api/v1/auth/login',
        null,
        loginBody(administratorEmail, administratorPassword)
    )

    assert inactiveLogin.statusCode == 403 :
        "El login de una cuenta inactiva devolvió HTTP ${inactiveLogin.statusCode}."
    assert inactiveLogin.code == 'ACCOUNT_INACTIVE' :
        'La respuesta de login no contiene ACCOUNT_INACTIVE.'

} catch (Throwable failure) {
    primaryFailure = failure
    throw failure

} finally {
    if (deactivationPatchAttempted && superUserJwt != null) {
        try {
            final Map activeResponse = changeAccessStatus(superUserJwt, 'ACTIVE')

            assert activeResponse.statusCode == 200 :
                "La restauración de Carlos devolvió HTTP ${activeResponse.statusCode}."
            assert activeResponse.status == 'ACTIVE' :
                'La respuesta de restauración no confirma top-level status ACTIVE.'

        } catch (Throwable cleanupFailure) {
            final String cleanupCategory = failureCategory(cleanupFailure)
            final AssertionError sanitizedCleanupFailure = new AssertionError(
                "La restauración falló; categoría=${cleanupCategory}; tipo=${cleanupFailure.class.name}."
            )

            if (primaryFailure != null) {
                primaryFailure.addSuppressed(sanitizedCleanupFailure)
            } else {
                throw sanitizedCleanupFailure
            }
        }
    }
}
