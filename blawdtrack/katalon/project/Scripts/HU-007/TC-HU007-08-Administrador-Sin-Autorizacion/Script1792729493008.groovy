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

assert superUserEmail?.trim() : 'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() : 'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'
assert administratorPassword?.trim() : 'BLAWDTRACK_ADMIN_NEW_PASSWORD no está configurada en el entorno de ejecución.'

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

/* Only status and required sanitized fields are retained; credentials, JWTs,
 * Authorization headers, request bodies and complete HTTP responses are never logged. */
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

            if (parsedPayload instanceof Map && parsedPayload.containsKey('code')) {
                fields.code = parsedPayload.code
            }
            if (parsedPayload instanceof Map && parsedPayload.containsKey('token')) {
                fields.token = parsedPayload.token instanceof String ? parsedPayload.token : null
            }
            if (path == '/api/v1/admins') {
                fields.administrator = locateAdministrator(parsedPayload)
            }
        }
        fields
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
    assert response.statusCode == 200 : "El login API devolvió HTTP ${response.statusCode}."
    assert response.token instanceof String && response.token.trim() : 'El login no devolvió el token top-level esperado.'
    response.token as String
}

final def sessionStatus = { String jwt ->
    httpRequest('GET', '/api/v1/auth/session', jwt, null)
}

final def readCarlos = { String jwt, String phase ->
    final Map response = httpRequest('GET', '/api/v1/admins', jwt, null)
    assert response.statusCode == 200 : "La consulta ${phase} de administradores devolvió HTTP ${response.statusCode}."
    assert response.administrator != null : "La consulta ${phase} no encontró exactamente a Carlos por CEDULA y correo."
    response.administrator as Map
}

final String carlosJwt = login(administratorEmail, administratorPassword)
final Map carlosSession = sessionStatus(carlosJwt)
assert carlosSession.statusCode == 204 :
    "La sesión autenticada de Carlos no fue aceptada: HTTP ${carlosSession.statusCode}."

final String superUserJwt = login(superUserEmail, superUserPassword)
final Map beforeAdministrator = readCarlos(superUserJwt, 'inicial')
assert beforeAdministrator.documentType?.toString()?.equalsIgnoreCase(documentType)
assert beforeAdministrator.documentNumber == documentNumber
assert beforeAdministrator.email == administratorEmail

final Object initialFullName = beforeAdministrator.fullName
final Object initialEmail = beforeAdministrator.email
final Object initialStatus = beforeAdministrator.status

final Map unauthorizedPatch = httpRequest(
    'PATCH',
    "/api/v1/admins/${documentType}/${documentNumber}",
    carlosJwt,
    JsonOutput.toJson([fullName: 'Cambio No Autorizado Katalon'])
)
assert unauthorizedPatch.statusCode == 403 :
    "El PATCH con el JWT de Carlos devolvió HTTP ${unauthorizedPatch.statusCode}."
assert unauthorizedPatch.code instanceof String && unauthorizedPatch.code.trim() :
    'La respuesta 403 no contiene un código de error top-level no vacío.'

final Map afterAdministrator = readCarlos(superUserJwt, 'final')
assert afterAdministrator.fullName == initialFullName :
    'El nombre completo de Carlos cambió después del PATCH no autorizado.'
assert afterAdministrator.email == initialEmail :
    'El correo de Carlos cambió después del PATCH no autorizado.'
assert afterAdministrator.status == initialStatus :
    'El estado de Carlos cambió después del PATCH no autorizado.'
