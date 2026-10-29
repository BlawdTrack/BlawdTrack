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

// TC-HU008-02: "Cancelar" cierra el diálogo sin eliminar: el administrador sigue en el sistema y puede iniciar sesión.
Env.prepareData()
Map admin = Users.createAdmin('borrar')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/admins/delete')
	Users.searchByDocument(admin.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Eliminar'), 30)
	WebUI.click(Users.resultButton('Eliminar'))
	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-cancel'), 30)
	WebUI.click(Ui.byTestId('confirm-dialog-cancel'))
	WebUI.waitForElementNotPresent(Ui.byTestId('confirm-dialog-confirm'), 10)
	WebUI.verifyElementPresent(Users.resultButton('Eliminar'), 10, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU008-02_cancelado')

	Ui.verifyEquals('HTTP login del administrador', Api.loginStatus(admin.email, admin.password), 200)
}
finally {
	WebUI.closeBrowser()
}
