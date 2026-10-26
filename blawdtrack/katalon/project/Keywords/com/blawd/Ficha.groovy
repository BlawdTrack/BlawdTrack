package com.blawd

import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

/**
 * Acciones compartidas de la consulta y la ficha del paquete (HU-013). Se apoya en los selectores por `data-testid`
 * de Ui; para contar ausencias usa JavaScript, porque `findWebElements` no sirve cuando no hay ningún elemento.
 */
public class Ficha {

	/** Abre la pantalla de consulta de paquetes y espera su campo de búsqueda. */
	static void openSearchPage() {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar')
		WebUI.waitForElementPresent(Ui.byTestId('package-search-input'), 30)
	}

	/** Escribe el número de envío y pulsa "Buscar"; espera la primera fila de resultado. */
	static void searchShipment(String shipmentNumber) {
		WebUI.setText(Ui.byTestId('package-search-input'), shipmentNumber)
		WebUI.click(Ui.byTestId('package-search-submit'))
		WebUI.waitForElementPresent(Ui.byTestId('package-result-row'), 30)
	}

	/** Busca un paquete y abre su fila: la forma en que un usuario llega a la ficha. */
	static void searchAndOpen(String shipmentNumber) {
		openSearchPage()
		searchShipment(shipmentNumber)
		WebUI.click(Ui.byTestId('package-result-row'))
		waitForDetail()
	}

	/** Abre la ficha directamente por su dirección (.../paquetes/buscar/<número>). */
	static void openDetail(String shipmentNumber) {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar/' + shipmentNumber)
		waitForDetail()
	}

	/**
	 * Espera a que la ficha y su línea de tiempo estén listas: la ficha consulta el paquete y el historial es una
	 * segunda llamada, así que sin esta espera la primera comprobación podría llegar antes de tiempo.
	 */
	static void waitForDetail() {
		WebUI.waitForElementPresent(Ui.byTestId('package-detail-card'), 30)
		WebUI.waitForElementPresent(Ui.byTestId('package-history-list'), 30)
	}

	/** Cantidad de elementos de un selector CSS, medida por JavaScript: no falla si no hay ninguno. */
	static int countCss(String selector) {
		String js = 'return document.querySelectorAll(' + "'" + selector.replace("'", "\\'") + "'" + ').length'
		Object result = WebUI.executeJavaScript(js, null)
		if (result instanceof Number) {
			return ((Number) result).intValue()
		}
		return (int) Double.parseDouble(String.valueOf(result))
	}

	/** Comprueba que el texto contenga la expresión regular en algún punto (no tiene que coincidir entero). */
	static void verifyMatches(String what, String actual, String regex) {
		boolean found = actual != null && java.util.regex.Pattern.compile(regex).matcher(actual).find()
		if (!found) {
			KeywordUtil.logInfo(what + ': no se encontró /' + regex + '/ en: ' + actual)
		}
		WebUI.verifyEqual(found, true, FailureHandling.CONTINUE_ON_FAILURE)
	}

	/**
	 * Texto visible de la página entera. Se lee con JavaScript (`innerText`) porque `WebUI.getPageText()` no existe
	 * en esta versión de Katalon; `innerText` devuelve lo mismo que ve el usuario (respeta lo oculto y el
	 * `text-transform` de las etiquetas).
	 */
	static String pageText() {
		Object result = WebUI.executeJavaScript('return document.body ? document.body.innerText : ""', null)
		return result == null ? '' : String.valueOf(result)
	}

	/**
	 * Espera hasta que el texto visible de la página contenga la expresión dada. Katalon no trae un
	 * `waitForTextPresent`, así que se consulta el texto de la página en un bucle hasta el plazo.
	 */
	static void waitForTextInPage(String text, int timeoutSeconds) {
		long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L
		while (System.currentTimeMillis() < deadline) {
			if (pageText().contains(text)) {
				return
			}
			WebUI.delay(1)
		}
		KeywordUtil.markFailedAndStop('El texto "' + text + '" no apareció en la página en ' + timeoutSeconds + ' s')
	}

	/** Espera hasta que la dirección del navegador cumpla la expresión regular (para redirecciones de roles). */
	static void waitForUrlMatches(String regex, int timeoutSeconds) {
		long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L
		while (System.currentTimeMillis() < deadline) {
			if (WebUI.getUrl() ==~ regex) {
				return
			}
			WebUI.delay(1)
		}
		KeywordUtil.markFailedAndStop("La dirección '" + WebUI.getUrl() + "' no cumple /" + regex + '/')
	}
}
