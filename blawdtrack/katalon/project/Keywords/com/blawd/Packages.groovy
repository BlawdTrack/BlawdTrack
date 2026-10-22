package com.blawd

import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

/**
 * Acciones de las pantallas de paquetes que usan los casos de HU-012 (eliminar paquete): buscar, abrir la ficha,
 * eliminar desde la fila o desde la ficha y leer los avisos. Los objetos se buscan por `data-testid` (ver la sección 9
 * de katalon/README.md); los avisos flotantes no tienen `data-testid`, así que se reconocen por su rol y su texto.
 */
public class Packages {

	static final int TIMEOUT = 30

	static TestObject xpath(String expression, String name = null) {
		TestObject object = new TestObject(name ?: expression)
		object.addProperty('xpath', ConditionType.EQUALS, expression)
		return object
	}

	/** Literal de XPath que admite comillas simples o dobles en el texto. */
	static String literal(String text) {
		if (!text.contains("'")) return "'" + text + "'"
		if (!text.contains('"')) return '"' + text + '"'
		return "concat('" + text.replace("'", "', \"'\", '") + "')"
	}

	// ---------- Búsqueda (lista de paquetes) ----------

	/** Abre "Consultar paquetes" y busca un número de envío (botón "Buscar"). */
	static void search(String shipmentNumber) {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar')
		WebUI.waitForElementVisible(Ui.byTestId('package-search-input'), TIMEOUT)
		WebUI.setText(Ui.byTestId('package-search-input'), shipmentNumber)
		WebUI.click(Ui.byTestId('package-search-submit'))
	}

	/** Botón "Eliminar" de la fila de ese paquete en la lista. */
	static TestObject rowDeleteButton(String shipmentNumber) {
		return Ui.css("[data-testid='package-row-delete'][aria-label='Eliminar paquete " + shipmentNumber + "']",
				'package-row-delete-' + shipmentNumber)
	}

	/** Espera a que la búsqueda muestre la fila del paquete. */
	static void waitForRow(String shipmentNumber) {
		WebUI.waitForElementVisible(rowDeleteButton(shipmentNumber), TIMEOUT)
	}

	// ---------- Ficha del paquete ----------

	/** Abre la ficha del paquete por su dirección y espera a que cargue. */
	static void openDetail(String shipmentNumber) {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar/' + shipmentNumber)
		WebUI.waitForElementVisible(Ui.byTestId('package-detail-card'), TIMEOUT)
	}

	// ---------- Diálogo de confirmación ----------

	static void waitForDialog() {
		WebUI.waitForElementVisible(Ui.byTestId('delete-package-confirm'), TIMEOUT)
	}

	static void waitForDialogClosed() {
		WebUI.waitForElementNotPresent(Ui.byTestId('delete-package-confirm'), TIMEOUT)
	}

	/** Texto completo del diálogo abierto (título, paquete y advertencia). */
	static String dialogText() {
		return WebUI.getText(xpath("//*[@role='alertdialog']", 'delete-package-dialog'))
	}

	// ---------- Avisos flotantes ----------

	/** Aviso flotante con ese texto (los avisos usan role="status"). */
	static TestObject message(String text) {
		return xpath("//*[@role='status' and contains(normalize-space(.), " + literal(text) + ")]", 'aviso: ' + text)
	}

	/** Comprueba que aparezca el aviso con ese texto. */
	static void verifyMessage(String text) {
		boolean shown = WebUI.waitForElementPresent(message(text), TIMEOUT, FailureHandling.OPTIONAL)
		if (!shown) KeywordUtil.logInfo('No apareció el aviso esperado: ' + text)
		WebUI.verifyEqual(shown, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Comprueba que el texto aparezca en la página (por ejemplo, la ficha de "Paquete eliminado"). */
	static void verifyPageText(String text) {
		boolean shown = WebUI.waitForElementPresent(xpath('//*[contains(normalize-space(.), ' + literal(text) + ')]'), TIMEOUT,
				FailureHandling.OPTIONAL)
		if (!shown) KeywordUtil.logInfo('No apareció en la página: ' + text)
		WebUI.verifyEqual(shown, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	// ---------- Base de datos del entorno de pruebas ----------

	// Los mismos valores por defecto que scripts/prepare-data.ps1 (contenedor y contraseña de docker-compose.e2e.yml).
	private static final String DB_CONTAINER = 'blawdtrack-e2e-mysql'
	private static final String DB_PASSWORD = 'e2e-root'

	/**
	 * Ejecuta una consulta en la base del entorno de pruebas (con `docker exec`, igual que prepare-data.ps1) y devuelve
	 * las filas como listas de columnas. Solo para comprobar lo que la interfaz todavía no muestra.
	 */
	static List<List<String>> query(String sql) {
		Process process = new ProcessBuilder('docker', 'exec', '-e', 'MYSQL_PWD=' + DB_PASSWORD, DB_CONTAINER,
				'mysql', '-uroot', '-N', '-B', '--default-character-set=utf8mb4', '-e', sql, 'blawdtrack')
				.redirectErrorStream(true)
				.start()
		String output = process.getInputStream().getText('UTF-8')
		int exitCode = process.waitFor()
		if (exitCode != 0) {
			KeywordUtil.markFailedAndStop('La consulta a la base de pruebas falló (código ' + exitCode + '): ' + output)
		}
		return output.readLines()
				.findAll { it.trim() && !it.startsWith('mysql:') }
				.collect { it.split('\t', -1) as List<String> }
	}

	/** Cantidad de paquetes con ese número de envío en la base. */
	static int countInDatabase(String shipmentNumber) {
		return Integer.parseInt(query("SELECT COUNT(*) FROM paquetes WHERE numero_envio = '" + shipmentNumber + "'")[0][0])
	}

	/** Id del último registro de auditoría, para reconocer los que se crean después. */
	static long lastAuditId() {
		return Long.parseLong(query('SELECT COALESCE(MAX(id), 0) FROM auditorias')[0][0])
	}

	/**
	 * Registro de auditoría de la eliminación de ese paquete creado después de `afterId`, con la cuenta que la hizo.
	 * @return [fecha_hora, correo, detalle], o null si no hay.
	 */
	static List<String> deletionAuditAfter(long afterId, String shipmentNumber) {
		List<List<String>> rows = query(
				"SELECT a.fecha_hora, u.correo, a.detalle FROM auditorias a JOIN usuarios u ON u.id = a.usuario_id " +
				"WHERE a.accion = 'ELIMINAR_PAQUETE' AND a.id > " + afterId + " AND a.detalle LIKE '%" + shipmentNumber + "%' " +
				'ORDER BY a.id DESC LIMIT 1')
		return rows ? rows[0] : null
	}
}
