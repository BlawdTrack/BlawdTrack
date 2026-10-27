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
import java.time.Instant
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

final String apiBaseUrl = (System.getenv('BLAWDTRACK_API_URL') ?: 'http://localhost:8080').replaceAll('/+$', '')
final String superUserEmail = System.getenv('BLAWDTRACK_SUPER_USER_EMAIL')
final String superUserPassword = System.getenv('BLAWDTRACK_SUPER_USER_PASSWORD')
final String expectedActorName = System.getenv('BLAWDTRACK_SUPER_USER_NAME')
final String administratorEmail = 'carlos.actualizado.katalon@example.com'
final String documentType = 'CEDULA'
final String documentNumber = '123456789'

assert superUserEmail?.trim() : 'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() : 'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'
assert expectedActorName?.trim() : 'BLAWDTRACK_SUPER_USER_NAME no está configurada en el entorno de ejecución; no se puede validar el actor de auditoría de forma segura.'

final JsonSlurper jsonSlurper = new JsonSlurper()
final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NEVER)
    .build()
final Duration requestTimeout = Duration.ofSeconds(15)

String superUserJwt = null
String originalFullName = null
boolean updateAttempted = false
Throwable primaryFailure = null

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
        value.values().each { Object nested -> collectMaps(nested, results) }
    } else if (value instanceof List) {
        value.each { Object nested -> collectMaps(nested, results) }
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
    [fullName: match.fullName, email: match.email, status: match.status,
     documentType: match.documentType, documentNumber: normalizedDocumentNumber(match.documentNumber)]
}

final def parseTimestamp = { Object value ->
    assert value instanceof String && value.trim() : 'El registro de auditoría no contiene un timestamp válido.'
    final String timestamp = value.toString().trim()
    try {
        OffsetDateTime.parse(timestamp, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toInstant()
    } catch (DateTimeParseException ignoredOffsetTimestamp) {
        try {
            LocalDateTime.parse(timestamp, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        } catch (DateTimeParseException ignoredLocalTimestamp) {
            throw new AssertionError('El timestamp del registro de auditoría no tiene formato ISO-8601 válido.')
        }
    }
}

final def compareTimestamps = { Object newer, Object older ->
    if (newer instanceof Instant && older instanceof Instant) return newer.compareTo(older)
    if (newer instanceof LocalDateTime && older instanceof LocalDateTime) return newer.compareTo(older)
    throw new AssertionError('No se pueden comparar timestamps de auditoría con y sin offset.')
}

final def httpRequest = { String method, String path, String jwt = null, String requestBody = null ->
    try {
        final HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("${apiBaseUrl}${path}"))
            .timeout(requestTimeout)
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
            final Object payload
            try {
                payload = jsonSlurper.parseText(responseText)
            } catch (Throwable ignoredJsonFailure) {
                throw new AssertionError('El backend devolvió un JSON no válido.')
            }
            if (payload instanceof Map && payload.containsKey('token')) {
                fields.token = payload.token instanceof String ? payload.token : null
            }
            if (path == '/api/v1/admins') {
                assert payload instanceof List : 'GET /api/v1/admins no devolvió un arreglo JSON top-level.'
                fields.administrator = locateAdministrator(payload)
            } else if (path.endsWith('/history')) {
                assert payload instanceof List : 'El historial de auditoría no devolvió un arreglo JSON top-level.'
                fields.history = payload as List
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
    final Map response = httpRequest('POST', '/api/v1/auth/login', null,
        JsonOutput.toJson([email: email, password: password]))
    assert response.statusCode == 200 : "El login API devolvió HTTP ${response.statusCode}."
    assert response.token instanceof String && response.token.trim() : 'El login no devolvió el token top-level esperado.'
    response.token as String
}

final def readAdministrator = { String jwt, String phase ->
    final Map response = httpRequest('GET', '/api/v1/admins', jwt, null)
    assert response.statusCode == 200 : "La consulta ${phase} de administradores devolvió HTTP ${response.statusCode}."
    assert response.administrator != null : "La consulta ${phase} no encontró exactamente a Carlos por documento y correo."
    response.administrator as Map
}

final def readHistory = { String jwt ->
    final String path = "/api/v1/admins/${documentType}/${documentNumber}/history"
    final Map response = httpRequest('GET', path, jwt, null)
    assert response.statusCode == 200 : "La consulta de historial devolvió HTTP ${response.statusCode}."
    assert response.history instanceof List : 'La consulta de historial no devolvió una lista utilizable.'
    response.history as List
}

final def updateFullName = { String jwt, String fullName ->
    httpRequest('PATCH', "/api/v1/admins/${documentType}/${documentNumber}", jwt,
        JsonOutput.toJson([fullName: fullName]))
}

final def auditIds = { List history ->
    history.collect { Map record ->
        assert record.id != null : 'Un registro de auditoría no contiene id.'
        record.id.toString()
    } as Set<String>
}

final def assertHistoryOrder = { List history ->
    for (int index = 1; index < history.size(); index++) {
        final Map newer = history[index - 1] as Map
        final Map older = history[index] as Map
        final Object newerTimestamp = parseTimestamp(newer.timestamp)
        final Object olderTimestamp = parseTimestamp(older.timestamp)
        final int timestampComparison = compareTimestamps(newerTimestamp, olderTimestamp)
        assert timestampComparison >= 0 : 'El historial no está ordenado por timestamp descendente.'
        if (timestampComparison == 0) {
            assert newer.id.toString().isNumber() && older.id.toString().isNumber() :
                'No se puede verificar el desempate por id porque uno de los ids no es numérico.'
            assert newer.id.toString().toBigInteger() >= older.id.toString().toBigInteger() :
                'El historial no está ordenado por id descendente cuando los timestamps coinciden.'
        }
    }
}

try {
    superUserJwt = login(superUserEmail, superUserPassword)

    final Map beforeAdministrator = readAdministrator(superUserJwt, 'inicial')
    assert beforeAdministrator.documentType?.toString()?.equalsIgnoreCase(documentType)
    assert beforeAdministrator.documentNumber == documentNumber
    assert beforeAdministrator.email == administratorEmail
    assert beforeAdministrator.status == 'ACTIVE' : 'Carlos no está ACTIVE antes de la actualización.'
    assert beforeAdministrator.fullName instanceof String && beforeAdministrator.fullName.trim()
    originalFullName = beforeAdministrator.fullName as String

    final List initialHistory = readHistory(superUserJwt)
    assertHistoryOrder(initialHistory)
    final Set<String> initialAuditIds = auditIds(initialHistory)
    final String temporaryFullName = "Carlos Katalon Audit ${System.currentTimeMillis()}"
    assert temporaryFullName != originalFullName

    updateAttempted = true
    final Map updateResponse = updateFullName(superUserJwt, temporaryFullName)
    assert updateResponse.statusCode == 200 : "La actualización del nombre devolvió HTTP ${updateResponse.statusCode}."

    final Map changedAdministrator = readAdministrator(superUserJwt, 'posterior')
    assert changedAdministrator.fullName == temporaryFullName : 'El GET posterior no confirma el nombre temporal esperado.'

    final List changedHistory = readHistory(superUserJwt)
    assertHistoryOrder(changedHistory)
    final List<Map> newAuditRecords = changedHistory.findAll { Map record -> !initialAuditIds.contains(record.id.toString()) }
    assert newAuditRecords.size() >= 1 : 'La actualización exitosa no creó un nuevo registro de auditoría.'
    final Map updateAudit = newAuditRecords.find { Map record ->
        record.action == 'ACTUALIZAR_ADMINISTRADOR' && record.actorName == expectedActorName &&
            record.details?.toString()?.contains('modificó los datos (nombre)') &&
            record.details.toString().contains(temporaryFullName) && record.details.toString().contains(documentNumber)
    }
    assert updateAudit != null : 'No se encontró el registro de auditoría esperado para la actualización.'
    parseTimestamp(updateAudit.timestamp)

} catch (Throwable failure) {
    primaryFailure = failure
    throw failure

} finally {
    if (updateAttempted && superUserJwt != null && originalFullName != null) {
        try {
            final Map currentAdministrator = readAdministrator(superUserJwt, 'cleanup')
            if (currentAdministrator.fullName != originalFullName) {
                final Set<String> beforeRestoreIds = auditIds(readHistory(superUserJwt))
                final Map restoreResponse = updateFullName(superUserJwt, originalFullName)
                assert restoreResponse.statusCode == 200 : "La restauración del nombre devolvió HTTP ${restoreResponse.statusCode}."
                final Map restoredAdministrator = readAdministrator(superUserJwt, 'verificación de cleanup')
                assert restoredAdministrator.fullName == originalFullName : 'Cleanup falló: el nombre original no fue restaurado.'
                final List afterRestoreHistory = readHistory(superUserJwt)
                assertHistoryOrder(afterRestoreHistory)
                final Map restoreAudit = afterRestoreHistory.find { Map record ->
                    !beforeRestoreIds.contains(record.id.toString()) && record.action == 'ACTUALIZAR_ADMINISTRADOR' &&
                        record.actorName == expectedActorName && record.details?.toString()?.contains('modificó los datos (nombre)') &&
                        record.details.toString().contains(originalFullName) && record.details.toString().contains(documentNumber)
                }
                assert restoreAudit != null : 'Cleanup falló: no existe el registro de auditoría de restauración.'
                parseTimestamp(restoreAudit.timestamp)
            } else {
                assert currentAdministrator.fullName == originalFullName : 'Cleanup no pudo confirmar el nombre original.'
            }
        } catch (Throwable cleanupFailure) {
            final AssertionError sanitizedCleanupFailure = new AssertionError(
                "La limpieza/restauración falló; categoría=${failureCategory(cleanupFailure)}; tipo=${cleanupFailure.class.name}."
            )
            if (primaryFailure != null) primaryFailure.addSuppressed(sanitizedCleanupFailure)
            else throw sanitizedCleanupFailure
        }
    }
}
