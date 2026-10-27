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
final String documentType = 'CEDULA'

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

/* The passing HU007-04 parser walks the complete decoded payload, including a top-level list. */
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
 * GET /api/v1/admins returns the administrator collection as a JSON array.
 * Keep the traversal compatible with the HU007-04 parser, but only accept a
 * collection-shaped payload so a malformed/error object cannot be treated as
 * a complete administrator list.
 */
final def extractCedulaNumbers = { Object payload ->
    if (!(payload instanceof List)) {
        return null
    }

    final List<Map> administratorMaps = []
    collectMaps(payload, administratorMaps)
    final Set<String> cedulas = new LinkedHashSet<String>()

    administratorMaps.each { Map administrator ->
        final String type = administrator.documentType?.toString()
        final String number = normalizedDocumentNumber(administrator.documentNumber)

        if (type?.equalsIgnoreCase(documentType) && number ==~ /\d{10}/) {
            cedulas.add(number)
        }
    }

    return cedulas
}

/* Generates Ecuador CEDULA-format numbers with a valid verifier digit. */
final def validCedulaCandidate = { int prefix ->
    final String firstNineDigits = String.format('%09d', prefix)
    int sum = 0

    firstNineDigits.toCharArray().eachWithIndex { Character digit, int index ->
        final int value = digit.toString().toInteger()
        final int weighted = index % 2 == 0 ? value * 2 : value
        sum += weighted > 9 ? weighted - 9 : weighted
    }

    final int verifier = (10 - (sum % 10)) % 10
    return firstNineDigits + verifier.toString()
}

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

            // This must be outside the Map-only block: the real collection is a top-level JSON array.
            if (path == '/api/v1/admins') {
                fields.cedulaNumbers = extractCedulaNumbers(parsedPayload)
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

/* Read-only precondition: choose a valid-format CEDULA confirmed absent by GET. */
final Map administratorsResponse = httpRequest(
    'GET',
    '/api/v1/admins',
    superUserJwt,
    null
)
assert administratorsResponse.statusCode == 200 :
    "La consulta de administradores devolvió HTTP ${administratorsResponse.statusCode}."
assert administratorsResponse.cedulaNumbers instanceof Set :
    'La consulta de administradores no devolvió una colección JSON completa y utilizable.'

final Set<String> existingCedulas = administratorsResponse.cedulaNumbers as Set<String>
String nonexistentDocumentNumber = null
for (int prefix = 900000000; prefix <= 900000999 && nonexistentDocumentNumber == null; prefix++) {
    final String candidate = validCedulaCandidate(prefix)
    if (!existingCedulas.contains(candidate)) {
        nonexistentDocumentNumber = candidate
    }
}

assert nonexistentDocumentNumber != null :
    'No fue posible seleccionar una CEDULA de formato válido ausente en el listado actual.'
assert !existingCedulas.contains(nonexistentDocumentNumber) :
    'La CEDULA seleccionada no está confirmada como ausente en el listado actual.'

final String updatePath = "/api/v1/admins/${documentType}/${nonexistentDocumentNumber}"
final Map updateResponse = httpRequest(
    'PATCH',
    updatePath,
    superUserJwt,
    JsonOutput.toJson([fullName: 'Administrador Inexistente Katalon'])
)

assert updateResponse.statusCode == 404 :
    "La actualización del administrador inexistente devolvió HTTP ${updateResponse.statusCode}."
assert updateResponse.code == 'ADMINISTRADOR_NO_EXISTENTE' :
    'La respuesta no contiene el código top-level ADMINISTRADOR_NO_EXISTENTE.'
