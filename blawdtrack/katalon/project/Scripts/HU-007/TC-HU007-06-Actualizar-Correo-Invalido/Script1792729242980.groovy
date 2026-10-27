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
final String invalidEmail = 'correo-invalido'
final String documentType = 'CEDULA'
final String documentNumber = '123456789'

assert superUserEmail?.trim() :
    'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() :
    'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'

final JsonSlurper jsonSlurper = new JsonSlurper()
final Duration connectionTimeout = Duration.ofSeconds(10)
final Duration requestTimeout = Duration.ofSeconds(15)

final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(connectionTimeout)
    .followRedirects(HttpClient.Redirect.NEVER)
    .build()

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

final def sanitizedTransportFailure = { String method, String path, Throwable failure ->
    if (failure instanceof InterruptedException) {
        Thread.currentThread().interrupt()
    }

    return new AssertionError(
        "Solicitud ${method} ${path} falló; categoría=${failureCategory(failure)}; tipo=${failure.class.name}."
    )
}

final def normalizedDocumentNumber = { Object value ->
    return value == null ? '' : value.toString().replaceAll(/\D/, '')
}

def collectMaps
collectMaps = { Object value, List<Map> results ->
    if (value instanceof Map) {
        results.add(value as Map)
        value.values().each { Object nestedValue ->
            collectMaps(nestedValue, results)
        }
    } else if (value instanceof List) {
        value.each { Object nestedValue ->
            collectMaps(nestedValue, results)
        }
    }
}

final def locateAdministrator = { Object payload ->
    final List<Map> candidates = []
    collectMaps(payload, candidates)

    final Map match = candidates.find { Map candidate ->
        candidate.documentType?.toString()?.equalsIgnoreCase(documentType) &&
            normalizedDocumentNumber(candidate.documentNumber) == documentNumber
    }

    if (match == null) {
        return null
    }

    return [
        email         : match.email,
        status        : match.status,
        documentType  : match.documentType,
        documentNumber: normalizedDocumentNumber(match.documentNumber)
    ]
}

/*
 * Only sanitized fields are returned. Credentials, JWTs, Authorization headers,
 * request bodies and complete HTTP responses are never logged or asserted in messages.
 */
final def httpRequest = { String method, String path, String jwt = null, String requestBody = null ->
    try {
        final HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("${apiBaseUrl}${path}"))
            .timeout(requestTimeout)
            .header('Accept', 'application/json')

        if (requestBody != null) {
            requestBuilder.header('Content-Type', 'application/json; charset=UTF-8')
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

        final HttpResponse<String> response = httpClient.send(
            requestBuilder.method(method, bodyPublisher).build(),
            HttpResponse.BodyHandlers.ofString(java.nio.charset.StandardCharsets.UTF_8)
        )

        final Map fields = [statusCode: response.statusCode()]
        final String responseText = response.body()

        if (responseText != null && responseText.trim()) {
            final Object parsedPayload
            try {
                parsedPayload = jsonSlurper.parseText(responseText)
            } catch (Throwable ignoredJsonFailure) {
                throw new AssertionError('El backend devolvió un JSON no válido.')
            }

            if (parsedPayload instanceof Map) {
                if (parsedPayload.containsKey('token')) {
                    fields.token = parsedPayload.token instanceof String ? parsedPayload.token : null
                }
                if (parsedPayload.containsKey('code')) {
                    fields.code = parsedPayload.code
                }
            }

            if (path == '/api/v1/admins') {
                fields.administrator = locateAdministrator(parsedPayload)
            }
        }

        return fields
    } catch (AssertionError assertionFailure) {
        throw assertionFailure
    } catch (Throwable failure) {
        throw sanitizedTransportFailure(method, path, failure)
    }
}

final def login = { String email, String password ->
    final Map response = httpRequest(
        'POST',
        '/api/v1/auth/login',
        null,
        JsonOutput.toJson([email: email, password: password])
    )

    assert response.statusCode == 200 :
        "El login API devolvió HTTP ${response.statusCode}."
    assert response.token instanceof String && response.token.trim() :
        'El login no devolvió el token top-level esperado.'

    return response.token as String
}

final String superUserJwt = login(superUserEmail, superUserPassword)

// Read-only GET precondition: capture Carlos's current email and status before PATCH.
final Map beforeResponse = httpRequest('GET', '/api/v1/admins', superUserJwt, null)
assert beforeResponse.statusCode == 200 :
    "La consulta inicial de administradores devolvió HTTP ${beforeResponse.statusCode}."
assert beforeResponse.administrator != null :
    'No se encontró a Carlos en la consulta inicial de solo lectura.'
assert beforeResponse.administrator.documentType?.toString()?.equalsIgnoreCase(documentType) :
    'El tipo de documento inicial de Carlos no coincide con CEDULA.'
assert beforeResponse.administrator.documentNumber == documentNumber :
    'El número de documento inicial de Carlos no coincide con el esperado.'
assert beforeResponse.administrator.email == administratorEmail :
    'El correo inicial de Carlos no coincide con el correo vigente esperado.'

final String initialEmail = beforeResponse.administrator.email as String
final Object initialStatus = beforeResponse.administrator.status

final Map invalidEmailResponse = httpRequest(
    'PATCH',
    "/api/v1/admins/${documentType}/${documentNumber}",
    superUserJwt,
    JsonOutput.toJson([email: invalidEmail])
)

assert invalidEmailResponse.statusCode == 400 :
    "La actualización con correo inválido devolvió HTTP ${invalidEmailResponse.statusCode}."
// Existing proven error contract exposes a top-level string 'code'; the value is intentionally not invented.
assert invalidEmailResponse.code instanceof String && invalidEmailResponse.code.trim() :
    'La respuesta de validación no contiene un código top-level no vacío.'

// Read-only postcondition: Carlos's email and status must remain unchanged.
final Map afterResponse = httpRequest('GET', '/api/v1/admins', superUserJwt, null)
assert afterResponse.statusCode == 200 :
    "La consulta final de administradores devolvió HTTP ${afterResponse.statusCode}."
assert afterResponse.administrator != null :
    'No se encontró a Carlos en la consulta final de solo lectura.'
assert afterResponse.administrator.email == initialEmail :
    'El correo de Carlos cambió después del rechazo de la actualización inválida.'
assert afterResponse.administrator.status == initialStatus :
    'El estado de Carlos cambió después del rechazo de la actualización inválida.'
assert afterResponse.administrator.email == administratorEmail :
    'El correo final de Carlos no coincide con el correo vigente esperado.'
