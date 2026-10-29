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

// TC-HU005-01: el Super Usuario busca al mensajero por su documento, pulsa "Desactivar", el diálogo pide confirmar y al
// aceptar el mensajero queda Inactivo (la cuenta no puede entrar). Mensajero: uno nuevo.
Env.prepareData()
Map courier = Users.createCourier('desact')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/couriers/deactivate')
	Users.searchByDocument(courier.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Desactivar'), 30)
	WebUI.click(Users.resultButton('Desactivar'))

	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-confirm'), 30)
	Ui.verifyContains(WebUI.getText(Packages.xpath("//*[@role='dialog' or @role='alertdialog']", 'dialogo')), courier.fullName)
	Ui.verifyContains(WebUI.getText(Packages.xpath("//*[@role='dialog' or @role='alertdialog']", 'dialogo')), 'perderá el acceso de inmediato')
	Ui.evidence('TC-HU005-01_dialogo')
	WebUI.click(Ui.byTestId('confirm-dialog-confirm'))

	Packages.verifyMessage('Mensajero desactivado correctamente.')
	WebUI.verifyElementPresent(Users.resultButton('Inactivo'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU005-01_desactivado')

	Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', courier.email), 'INACTIVE')
	Ui.verifyEquals('HTTP login del mensajero desactivado', Api.loginStatus(courier.email, courier.password), 403)
}
finally {
	WebUI.closeBrowser()
}
