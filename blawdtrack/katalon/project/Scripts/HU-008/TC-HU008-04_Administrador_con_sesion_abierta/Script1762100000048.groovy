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

// TC-HU008-04: si el administrador tiene una sesión abierta, el diálogo lo avisa ("se cerrará automáticamente al
// eliminarlo"); al confirmar, su sesión deja de valer de inmediato.
Env.prepareData()
Map admin = Users.createAdmin('sesion')
String token = Api.tokenFor(admin.email, admin.password)
Ui.verifyEquals('HTTP GET /api/v1/auth/session con la sesión abierta', Api.statusOf('GET', '/api/v1/auth/session', token), 204)
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/admins/delete')
	Users.searchByDocument(admin.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Eliminar'), 30)
	WebUI.click(Users.resultButton('Eliminar'))
	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-confirm'), 30)
	Ui.verifyContains(WebUI.getText(Packages.xpath("//*[@role='dialog' or @role='alertdialog']", 'dialogo')), 'Este administrador tiene una sesión abierta. Se cerrará automáticamente al eliminarlo.')
	Ui.evidence('TC-HU008-04_sesion_abierta')
	WebUI.click(Ui.byTestId('confirm-dialog-confirm'))
	Packages.verifyMessage('Administrador eliminado correctamente.')

	Ui.verifyEquals('HTTP GET /api/v1/auth/session tras eliminar', Api.statusOf('GET', '/api/v1/auth/session', token), 401)
}
finally {
	WebUI.closeBrowser()
}
