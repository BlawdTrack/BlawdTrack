import com.blawd.Api
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-09: un Mensajero no puede importar. En la interfaz la ruta lo devuelve a su inicio (/mensajero), el menu
// no ofrece la importacion y la API responde 403.
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyElementNotPresent(Ui.byTestId('nav-/main-menu/paquetes/importar'), 5, FailureHandling.CONTINUE_ON_FAILURE)

	// Entrar por la direccion directamente tampoco le abre la pantalla.
	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/importar')
	WebUI.waitForElementNotPresent(Ui.byTestId('import-select-file'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyElementNotPresent(Ui.byTestId('import-file-input'), 5, FailureHandling.CONTINUE_ON_FAILURE)

	Ui.evidence('TC-HU010-09_acceso_denegado')

	// La seguridad real la aplica el backend: acceso denegado (403) a la previsualizacion y a la importacion.
	String token = Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
	Ui.verifyEquals('HTTP POST /api/v1/packages/import/preview', Api.statusOf('POST', '/api/v1/packages/import/preview', token, '{}'), 403)
	Ui.verifyEquals('HTTP POST /api/v1/packages/import', Api.statusOf('POST', '/api/v1/packages/import', token, '{}'), 403)
}
finally {
	WebUI.closeBrowser()
}
