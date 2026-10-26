import com.blawd.Api
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-07: un Mensajero no puede eliminar paquetes. En la interfaz la busqueda y la ficha lo devuelven a su inicio
// (/mensajero) y nunca ve "Eliminar"; la API responde 403 y el paquete sigue. Paquete: E2E-DEL-A2. No modifica datos.
String number = 'E2E-DEL-A2'
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)

	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar')
	WebUI.waitForElementNotPresent(Ui.byTestId('package-search-input'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)

	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar/' + number)
	WebUI.waitForElementNotPresent(Ui.byTestId('package-detail-card'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyElementNotPresent(Ui.byTestId('delete-package-button'), 3, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyElementNotPresent(Ui.byTestId('package-row-delete'), 3, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU012-07_acceso_denegado')

	// La seguridad real la aplica el backend: acceso denegado (403) y el paquete sigue.
	String token = Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
	Ui.verifyEquals('HTTP DELETE /api/v1/packages/' + number + ' (Mensajero)', Api.statusOf('DELETE', '/api/v1/packages/' + number, token), 403)
	Ui.verifyEquals('paquetes ' + number + ' en la base', Packages.countInDatabase(number), 1)
}
finally {
	WebUI.closeBrowser()
}
