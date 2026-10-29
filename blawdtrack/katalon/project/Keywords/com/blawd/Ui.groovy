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

	static void openPackageSearchPage() {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar')
		WebUI.waitForElementPresent(byTestId('package-search-input'), 30)
	}

	static void selectPackageSearchField(String field) {
		WebUI.click(byTestId('package-search-field'))
		TestObject option = css("[role='option'][data-value='" + field + "']", 'search-field-' + field)
		WebUI.waitForElementVisible(option, 10)
		WebUI.click(option)
	}

	static void searchPackage(String field, String term, String shipment, String evidenceName) {
		selectPackageSearchField(field)
		WebUI.setText(byTestId('package-search-input'), term)
		WebUI.click(byTestId('package-search-submit'))

		waitForSearchResult(shipment, term)
		evidence(evidenceName)
	}

	static void waitForSearchResult(String shipment, String term) {
		WebUI.waitForElementVisible(css("[data-testid='package-result-row'] a[href\$='/" + shipment + "']"), 20)
		verifyContains(textOf('package-result-row'), shipment)
		verifyContains(WebUI.getText(byTestId('package-search-summary')), term)
	}

	/**
	 * Paso 1 de la importación: elige el archivo y pulsa "Revisar datos". El selector de archivo está oculto
	 * (display: none), así que la prueba lo muestra antes de subir el archivo; la aplicación no cambia.
	 */
	static void uploadAndReview(String fileName) {
		selectFile(fileName)
		WebUI.click(byTestId('import-review'))
		WebUI.waitForElementPresent(byTestId('import-count-read'), 30)
	}

	/** Elige el archivo en la zona de carga sin pulsar "Revisar datos". */
	static void selectFile(String fileName) {
		WebUI.executeJavaScript('document.querySelector("[data-testid=\'import-file-input\']").style.display = "block"', null)
		WebUI.uploadFile(byTestId('import-file-input'), Env.importFilePath(fileName))
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

	static void evidence(String name) {
		WebUI.takeScreenshot(Env.evidencePath(name))
	}

	// ---------- Inicio de sesión y navegación (HU-001 a HU-009) ----------

	/** Abre el navegador en la pantalla de inicio de sesión y envía el formulario, sin esperar a que cambie la pantalla. */
	static void loginAttempt(String email, String password) {
		WebUI.openBrowser('')
		WebUI.maximizeWindow()
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/login')
		WebUI.waitForElementPresent(byTestId('login-submit'), 30)
		WebUI.setText(css('#login-email'), email)
		WebUI.setText(css('#login-password'), password)
		WebUI.click(byTestId('login-submit'))
	}

	/** Cierra la sesión con el botón del menú lateral y espera a la pantalla de inicio de sesión. */
	static void logout() {
		WebUI.click(byTestId('logout-button'))
		WebUI.waitForElementPresent(byTestId('login-submit'), 30)
	}

	/** Espera a que la dirección cumpla el patrón (la aplicación redirige sola) y lo comprueba. */
	static void verifyUrl(String regex, int timeoutSeconds = 15) {
		long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L
		while (System.currentTimeMillis() < deadline && !WebUI.getUrl().matches(regex)) {
			Thread.sleep(300)
		}
		KeywordUtil.logInfo('URL: ' + WebUI.getUrl() + ', patrón: ' + regex)
		WebUI.verifyMatch(WebUI.getUrl(), regex, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Entra por la dirección (sin pasar por el menú) y espera a que la aplicación decida a dónde llevar. */
	static void goTo(String path) {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + path)
		WebUI.waitForPageLoad(15)
	}

	/** Enlace del menú lateral (`nav-<ruta>`): si no está para ese rol, el menú no lo ofrece. */
	static void verifyNavLink(String path, boolean visible) {
		if (visible) {
			WebUI.verifyElementPresent(byTestId('nav-' + path), 10, FailureHandling.CONTINUE_ON_FAILURE)
		} else {
			WebUI.verifyElementNotPresent(byTestId('nav-' + path), 5, FailureHandling.CONTINUE_ON_FAILURE)
		}
	}

	// ---------- Avisos, formularios y selectores de rueda ----------

	/** Aviso fijo dentro del formulario (`role="alert"`) que contiene ese texto. */
	static TestObject alert(String text) {
		return Packages.xpath("//*[@role='alert' and contains(normalize-space(.), " + Packages.literal(text) + ")]", 'alerta: ' + text)
	}

	/** Comprueba que aparezca el aviso fijo con ese texto. */
	static void verifyAlert(String text) {
		boolean shown = WebUI.waitForElementPresent(alert(text), 20, FailureHandling.OPTIONAL)
		if (!shown) KeywordUtil.logInfo('No apareció el aviso esperado: ' + text)
		WebUI.verifyEqual(shown, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Texto de ayuda de un campo con error (los campos no llevan `data-testid`; se reconoce por su texto). */
	static void verifyFieldError(String text) {
		TestObject error = Packages.xpath("//*[contains(@id,'helper-text') and contains(normalize-space(.), " + Packages.literal(text) + ")]",
				'error-campo: ' + text)
		boolean shown = WebUI.waitForElementPresent(error, 10, FailureHandling.OPTIONAL)
		if (!shown) KeywordUtil.logInfo('No apareció el error de campo esperado: ' + text)
		WebUI.verifyEqual(shown, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/** Campo de texto de un formulario por su atributo `name` (o `id`, si no lo tiene). */
	static TestObject field(String nameOrId) {
		return css("input[name='" + nameOrId + "'], input#" + nameOrId, 'campo-' + nameOrId)
	}

	/**
	 * Reemplaza el texto de un campo (aunque ya tenga uno): selecciona todo, borra y escribe. `WebUI.setText` solo limpia
	 * con `clear()`, que los campos de React no registran, y el texto nuevo se sumaría al anterior.
	 */
	static void replaceText(TestObject field, String value) {
		WebUI.click(field)
		WebUI.sendKeys(field, Keys.chord(Keys.CONTROL, 'a'))
		WebUI.sendKeys(field, Keys.chord(Keys.BACK_SPACE))
		WebUI.sendKeys(field, value)
	}

	static void type(String nameOrId, String value) {
		WebUI.waitForElementVisible(field(nameOrId), 15)
		replaceText(field(nameOrId), value)
	}

	/** Valor actual de un campo de texto. */
	static String valueOf(String nameOrId) {
		WebUI.waitForElementVisible(field(nameOrId), 15)
		return WebUI.getAttribute(field(nameOrId), 'value')
	}

	private static TestObject wheelOption(String listLabel, String optionText) {
		return Packages.xpath("//*[@role='listbox' and @aria-label=" + Packages.literal(listLabel) + "]//*[@role='option' and normalize-space(.)=" +
				Packages.literal(optionText) + "]", 'rueda-' + listLabel + '-' + optionText)
	}

	private static void confirmWheel() {
		WebUI.click(Packages.xpath("//button[normalize-space(.)='Listo']", 'rueda-listo'))
		WebUI.waitForElementNotPresent(Packages.xpath("//button[normalize-space(.)='Listo']", 'rueda-listo'), 10)
	}

	/**
	 * Elige una hora en el selector de rueda de un campo (`Hora de entrada` u `Hora de salida`). La rueda solo muestra
	 * las horas cercanas a la actual (4 hacia cada lado), así que se eligen valores dentro de ese rango.
	 */
	static void pickTime(String inputSelector, String label, String hour, String minute, String period) {
		WebUI.click(css(inputSelector))
		WebUI.click(wheelOption(label + ': hora', hour))
		WebUI.click(wheelOption(label + ': minutos', minute))
		WebUI.click(wheelOption(label + ': am o pm', period))
		confirmWheel()
	}

	/** Elige la capacidad de carga en su rueda (un valor cercano al actual: 4 hacia cada lado). */
	static void pickWeight(String inputSelector, String label, String kilos) {
		WebUI.click(css(inputSelector))
		WebUI.click(wheelOption(label, kilos))
		confirmWheel()
	}

	// ---------- Recuperar contraseña (HU-002) ----------

	/** Abre el navegador en "Recuperar contraseña", pide el enlace para ese correo y espera la pantalla "Revisa tu correo". */
	static void requestRecovery(String email) {
		WebUI.openBrowser('')
		WebUI.maximizeWindow()
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/password-recovery')
		WebUI.waitForElementPresent(byTestId('recovery-submit'), 30)
		WebUI.setText(css('#recovery-email'), email)
		WebUI.click(byTestId('recovery-submit'))
		WebUI.waitForElementPresent(byTestId('recovery-email-sent'), 30)
	}

	/** Abre el enlace del correo (o cualquier dirección de /recovery) y espera el formulario de la nueva contraseña. */
	static void openRecoveryLink(String link) {
		WebUI.navigateToUrl(link)
		WebUI.waitForElementPresent(css('#new-password'), 30)
	}

	/** Escribe la nueva contraseña y su confirmación (no pulsa "Guardar"). */
	static void typeNewPassword(String password, String confirmation) {
		replaceText(css('#new-password'), password)
		replaceText(css('#confirm-password'), confirmation)
	}

	/** El botón "Guardar nueva contraseña" está bloqueado (`true`) o disponible (`false`). */
	static void verifyNewPasswordSubmitDisabled(String what, boolean disabled) {
		boolean actual = WebUI.getAttribute(byTestId('new-password-submit'), 'disabled') != null
		verifyEquals(what + ': botón bloqueado', actual, disabled)
	}

	/** Botón por su texto visible. */
	static TestObject buttonByText(String text) {
		return Packages.xpath("//button[normalize-space(.)='" + text + "']", 'boton-' + text)
	}
}
