import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar')
	WebUI.waitForElementNotPresent(Ui.byTestId('package-search-input'), 15)
	WebUI.verifyMatch(WebUI.getUrl(), '.*/mensajero$', true, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU014-10_acceso_denegado')
}
finally {
	WebUI.closeBrowser()
}
