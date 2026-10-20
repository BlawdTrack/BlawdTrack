package com.blawd

import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import org.openqa.selenium.Keys

import internal.GlobalVariable

/**
 * Acciones de interfaz compartidas por los casos. Los objetos de prueba se construyen por `data-testid` (ver la tabla
 * de selectores de katalon/README.md), nunca por texto ni por clases de MUI.
 */
public class Ui {

	static TestObject byTestId(String testId) {
		return css("[data-testid='" + testId + "']", 'testid-' + testId)
	}

	static TestObject css(String selector, String name = null) {
		TestObject object = new TestObject(name ?: selector)
		object.addProperty('css', ConditionType.EQUALS, selector)
		return object
	}

	/** Abre el navegador e inicia sesión con una de las cuentas de Profiles/default. */
	static void login(String email, String password) {
		WebUI.openBrowser('')
		WebUI.maximizeWindow()
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/login')
		WebUI.waitForElementPresent(byTestId('login-submit'), 30)
		WebUI.setText(css('#login-email'), email)
		WebUI.setText(css('#login-password'), password)
		WebUI.click(byTestId('login-submit'))
		WebUI.waitForElementNotPresent(byTestId('login-submit'), 30)
	}

	static void openImportPage() {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/importar')
		WebUI.waitForElementPresent(byTestId('import-select-file'), 30)
	}

	/**
	 * Paso 1 de la importación: elige el archivo y pulsa "Revisar datos". El selector de archivo está oculto
	 * (display: none), así que la prueba lo muestra antes de subir el archivo; la aplicación no cambia.
	 */
	static void uploadAndReview(String fileName) {
		WebUI.executeJavaScript('document.querySelector("[data-testid=\'import-file-input\']").style.display = "block"', null)
		WebUI.uploadFile(byTestId('import-file-input'), Env.importFilePath(fileName))
		WebUI.click(byTestId('import-review'))
		WebUI.waitForElementPresent(byTestId('import-count-read'), 30)
	}

	static int count(String name) {
		return Integer.parseInt(WebUI.getText(byTestId('import-count-' + name)).trim())
	}

	/** Compara dos valores y deja en el log qué se comparaba, para identificar la comprobación que falla. */
	static void verifyEquals(String what, Object actual, Object expected) {
		KeywordUtil.logInfo(what + ': actual=' + actual + ', esperado=' + expected)
		WebUI.verifyEqual(actual, expected, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Compara los cuatro totales de la previsualización: leídos, válidos, con errores y duplicados. */
	static void verifyCounts(int read, int valid, int invalid, int duplicate) {
		verifyEquals('total leidos', count('read'), read)
		verifyEquals('total validos', count('valid'), valid)
		verifyEquals('total con errores', count('invalid'), invalid)
		verifyEquals('total duplicados', count('duplicate'), duplicate)
	}

	/** Texto visible de todas las filas con ese data-testid, unido en un solo texto. */
	static String textOf(String testId) {
		return WebUI.findWebElements(byTestId(testId), 5).collect { it.getText() }.join('\n')
	}

	/** Comprueba que el texto contenga lo esperado. */
	static void verifyContains(String actual, String expected) {
		boolean found = actual.contains(expected)
		if (!found) {
			KeywordUtil.logInfo("Se esperaba encontrar '" + expected + "' en: " + actual)
		}
		WebUI.verifyEqual(found, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Comprueba que el texto NO contenga lo indicado. */
	static void verifyNotContains(String actual, String unexpected) {
		boolean found = actual.contains(unexpected)
		if (found) {
			KeywordUtil.logInfo("No se esperaba encontrar '" + unexpected + "' en: " + actual)
		}
		WebUI.verifyEqual(found, false, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Cantidad de elementos con ese data-testid que hay en la página. */
	static int countOf(String testId) {
		return WebUI.findWebElements(byTestId(testId), 5).size()
	}

	/** Busca un paquete en Consultar paquetes por su número de envío. */
	static void searchPackage(String term) {
		// setText no vacia bien un campo de React: en la segunda busqueda el termino nuevo se pegaba al anterior
		// (E2E-HU011-A01E2E-PEND-01) y no habia resultados. Se selecciona todo, se borra y se escribe el termino.
		TestObject input = byTestId('package-search-input')
		WebUI.click(input)
		WebUI.sendKeys(input, Keys.chord(Keys.CONTROL, 'a'))
		WebUI.sendKeys(input, Keys.BACK_SPACE)
		WebUI.sendKeys(input, term)
		WebUI.click(byTestId('package-search-submit'))

		// Mientras busca, la lista anterior desaparece: se espera a que el resumen ya mencione el termino buscado y
		// recien entonces a las filas, para no contar la lista vieja (ni una lista vacia por la carga).
		TestObject summary = new TestObject('search-summary-' + term)
		summary.addProperty('xpath', ConditionType.EQUALS, "//*[@data-testid='package-search-summary'][contains(., '" + term + "')]")
		WebUI.waitForElementPresent(summary, 30)
		WebUI.waitForElementPresent(byTestId('package-result-row'), 30)
		KeywordUtil.logInfo("Resumen de la busqueda '" + term + "': " + WebUI.getText(byTestId('package-search-summary')))
	}

	static void evidence(String name) {
		WebUI.takeScreenshot(Env.evidencePath(name))
	}
}
