import com.blawd.Api
import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-08: el Mensajero no puede consultar la ficha. Su menu no ofrece la busqueda, entrar por la direccion
// directa lo devuelve a su inicio sin abrir la ficha y la API responde 403 (mismo patron que TC-HU011-06).
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	Ficha.waitForUrlMatches('.*/mensajero$', 30)
	WebUI.verifyElementNotPresent(Ui.byTestId('nav-/main-menu/paquetes/buscar'), 5, FailureHandling.CONTINUE_ON_FAILURE)

	// Entrar por la direccion directa tampoco le abre la ficha.
	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar/E2E-ENTR-01')
	Ficha.waitForUrlMatches('.*/mensajero$', 30)
	Ui.verifyEquals('la ficha no se abre para el mensajero', Ficha.countCss('[data-testid="package-detail-card"]'), 0)

	Ui.evidence('TC-HU013-08_acceso_denegado')

	// La seguridad real la aplica el backend: ni el detalle ni el historial responden al mensajero.
	String token = Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
	Ui.verifyEquals('HTTP GET /api/v1/packages/E2E-ENTR-01', Api.statusOf('GET', '/api/v1/packages/E2E-ENTR-01', token), 403)
	Ui.verifyEquals('HTTP GET /api/v1/packages/E2E-ENTR-01/history', Api.statusOf('GET', '/api/v1/packages/E2E-ENTR-01/history', token), 403)
}
finally {
	WebUI.closeBrowser()
}
