package com.blawd

import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * Pasos de la importación (HU-010) que van más allá de la previsualización: confirmar, leer el aviso del paso 1 y
 * comprobar en "Consultar paquetes" lo que quedó registrado. Los objetos se buscan por `data-testid`.
 */
public class Imports {

	/** Datos de un paquete tal como deben verse en la lista después de importarlo. */
	static void verifyListed(String shipment, String order, String customer, String address, String phone, String schedule) {
		Packages.search(shipment)
		Ui.waitForSearchResult(shipment, shipment)

		String row = Ui.textOf('package-result-row')
		Ui.verifyContains(row, 'Pendiente')
		Ui.verifyContains(row, shipment)
		Ui.verifyContains(row, order)
		Ui.verifyContains(row, customer)
		Ui.verifyContains(row, address)
		Ui.verifyContains(row, phone)
		Ui.verifyContains(row, schedule)
	}

	/** Comprueba que el paquete NO esté en la lista (la búsqueda termina sin resultados). */
	static void verifyNotListed(String shipment) {
		Packages.search(shipment)
		WebUI.waitForElementVisible(Ui.byTestId('package-search-empty-title'), Packages.TIMEOUT, FailureHandling.CONTINUE_ON_FAILURE)
		Ui.verifyEquals('filas para ' + shipment, Ui.countOf('package-result-row'), 0)
	}

	/** Pulsa "Confirmar importación"; al terminar la pantalla pasa sola a "Consultar paquetes" con un aviso. */
	static void confirm() {
		WebUI.click(Ui.byTestId('import-confirm'))
		WebUI.waitForElementPresent(Ui.byTestId('package-search-input'), Packages.TIMEOUT)
	}

	/** Texto del aviso de error del paso 1 (por ejemplo, el formato no permitido). */
	static String uploadAlertText() {
		WebUI.waitForElementVisible(Ui.css("form [role='alert']", 'upload-alert'), 10)
		return WebUI.getText(Ui.css("form [role='alert']", 'upload-alert'))
	}

	/** El botón "Confirmar importación" existe pero no se puede pulsar. */
	static void verifyConfirmDisabled() {
		WebUI.verifyElementHasAttribute(Ui.byTestId('import-confirm'), 'disabled', 5, FailureHandling.CONTINUE_ON_FAILURE)
	}
}
