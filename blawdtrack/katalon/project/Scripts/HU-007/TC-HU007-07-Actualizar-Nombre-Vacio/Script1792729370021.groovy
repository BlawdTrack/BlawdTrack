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
final String documentType = 'CEDULA'
final String documentNumber = '123456789'

assert superUserEmail?.trim() : 'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() : 'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'

final JsonSlurper jsonSlurper = new JsonSlurper()
final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NEVER)
    .build()

final def failureCategory = { Throwable failure ->
    if (failure instanceof HttpTimeoutException) return 'TIMEOUT'
    if (failure instanceof ConnectException) return 'CONNECTION_UNAVAILABLE'
    if (failure instanceof ProtocolException) return 'HTTP_PROTOCOL'
    if (failure instanceof IllegalArgumentException) return 'INVALID_URI_OR_REQUEST'
    if (failure instanceof IOException) return 'IO_TRANSPORT'
    if (failure instanceof InterruptedException) return 'INTERRUPTED'
    return 'UNEXPECTED_TRANSPORT'
}

final def sanitizedTransportFailure = { String method, String path, Throwable failure ->
    if (failure instanceof InterruptedException) Thread.currentThread().interrupt()
    new AssertionError("Solicitud ${method} ${path} falló; categoría=${failureCategory(failure)}; tipo=${failure.class.name}.")
}

final def normalizedDocumentNumber = { Object value ->
    value == null ? '' : value.toString().replaceAll(/\D/, '')
}

def collectMaps
collectMaps = { Object value, List<Map> results ->
    if (value instanceof Map) {
        results.add(value as Map)
        value.values().each { Object nestedValue -> collectMaps(nestedValue, results) }
    } else if (value instanceof List) {
        value.each { Object nestedValue -> collectMaps(nestedValue, results) }
    }
}

final def locateAdministrator = { Object payload ->
    final List<Map> candidates = []
    collectMaps(payload, candidates)
    final List<Map> matches = candidates.findAll { Map candidate ->
        candidate.documentType?.toString()?.equalsIgnoreCase(documentType) &&
            normalizedDocumentNumber(candidate.documentNumber) == documentNumber &&
            candidate.email?.toString() == administratorEmail
    }
    if (matches.size() != 1) return null
    final Map match = matches[0]
    [
        fullName      : match.fullName,
        email         : match.email,
        status        : match.status,
        documentType  : match.documentType,
        documentNumber: normalizedDocumentNumber(match.documentNumber)
    ]
}

/* Only sanitized fields are retained; credentials, JWTs, Authorization headers,
 * request bodies and complete HTTP responses are never logged or included in assertions. */
final def httpRequest = { String method, String path, String jwt = null, String requestBody = null ->
    try {
        final HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("${apiBaseUrl}${path}"))
            .timeout(Duration.ofSeconds(15))
            .header('Accept', 'application/json')
        if (requestBody != null) requestBuilder.header('Content-Type', 'application/json; charset=UTF-8')
        if (jwt != null) requestBuilder.header('Authorization', "Bearer ${jwt}")

        final HttpRequest.BodyPublisher bodyPublisher = requestBody == null
            ? HttpRequest.BodyPublishers.noBody()
            : HttpRequest.BodyPublishers.ofString(requestBody, java.nio.charset.StandardCharsets.UTF_8)
        final HttpResponse<String> response = httpClient.send(
            requestBuilder.method(method, bodyPublisher).build(),
            HttpResponse.BodyHandlers.ofString(java.nio.charset.StandardCharsets.UTF_8)
        )
        final Map fields = [statusCode: response.statusCode()]
        final String responseText = response.body()
        if (responseText?.trim()) {
            final Object parsedPayload
            try {
                parsedPayload = jsonSlurper.parseText(responseText)
            } catch (Throwable ignoredJsonFailure) {
                throw new AssertionError('El backend devolvió un JSON no válido.')
            }
            if (parsedPayload instanceof Map && parsedPayload.containsKey('code')) fields.code = parsedPayload.code
            if (parsedPayload instanceof Map && parsedPayload.containsKey('token')) {
                fields.token = parsedPayload.token instanceof String ? parsedPayload.token : null
            }
            if (path == '/api/v1/admins') fields.administrator = locateAdministrator(parsedPayload)
        }
        fields
    } catch (AssertionError assertionFailure) {
        throw assertionFailure
    } catch (Throwable failure) {
        throw sanitizedTransportFailure(method, path, failure)
    }
}

final def login = { String email, String password ->
    final Map response = httpRequest('POST', '/api/v1/auth/login', null,
        JsonOutput.toJson([email: email, password: password]))
    assert response.statusCode == 200 : "El login API devolvió HTTP ${response.statusCode}."
    assert response.token instanceof String && response.token.trim() : 'El login no devolvió el token top-level esperado.'
    response.token as String
}

final String superUserJwt = login(superUserEmail, superUserPassword)

final Map beforeResponse = httpRequest('GET', '/api/v1/admins', superUserJwt, null)
assert beforeResponse.statusCode == 200 : "La consulta inicial de administradores devolvió HTTP ${beforeResponse.statusCode}."
assert beforeResponse.administrator != null :
    'La consulta inicial no identifica exactamente un único Carlos por documento y correo; se aborta antes de PATCH.'
assert beforeResponse.administrator.documentType?.toString()?.equalsIgnoreCase(documentType)
assert beforeResponse.administrator.documentNumber == documentNumber
assert beforeResponse.administrator.email == administratorEmail

final Object initialFullName = beforeResponse.administrator.fullName
final Object initialEmail = beforeResponse.administrator.email
final Object initialStatus = beforeResponse.administrator.status

final Map validationResponse = httpRequest(
    'PATCH',
    "/api/v1/admins/${documentType}/${documentNumber}",
    superUserJwt,
    JsonOutput.toJson([fullName: ''])
)

// TC-HU007-06 establishes the backend validation-error contract as HTTP 400 with a non-empty top-level code.
assert validationResponse.statusCode == 400 :
    "La actualización con nombre vacío devolvió HTTP ${validationResponse.statusCode}."
assert validationResponse.code instanceof String && validationResponse.code.trim() :
    'La respuesta de validación no contiene un campo code top-level no vacío.'

final Map afterResponse = httpRequest('GET', '/api/v1/admins', superUserJwt, null)
assert afterResponse.statusCode == 200 : "La consulta final de administradores devolvió HTTP ${afterResponse.statusCode}."
assert afterResponse.administrator != null :
    'La consulta final no identifica exactamente un único Carlos por documento y correo.'
assert afterResponse.administrator.fullName == initialFullName :
    'El nombre completo de Carlos cambió después del rechazo de la actualización.'
assert afterResponse.administrator.email == initialEmail :
    'El correo de Carlos cambió después del rechazo de la actualización.'
assert afterResponse.administrator.status == initialStatus :
    'El estado de Carlos cambió después del rechazo de la actualización.'
