import com.blawd.Api
import com.blawd.Env
import com.blawd.Mail
import com.blawd.Packages
import com.blawd.Ui
import com.blawd.Users
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU005-02: "Cancelar" cierra el diálogo sin desactivar: el mensajero sigue Activo y puede iniciar sesión.
Env.prepareData()
Map courier = Users.createCourier('desact')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/couriers/deactivate')
	Users.searchByDocument(courier.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Desactivar'), 30)
	WebUI.click(Users.resultButton('Desactivar'))
	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-cancel'), 30)
	WebUI.click(Ui.byTestId('confirm-dialog-cancel'))
	WebUI.waitForElementNotPresent(Ui.byTestId('confirm-dialog-confirm'), 10)
	WebUI.verifyElementPresent(Users.resultButton('Desactivar'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU005-02_cancelado')

	Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', courier.email), 'ACTIVE')
	Ui.verifyEquals('HTTP login del mensajero', Api.loginStatus(courier.email, courier.password), 200)
}
finally {
	WebUI.closeBrowser()
}
