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

// TC-HU008-01: el Super Usuario busca al administrador por su documento, pulsa "Eliminar", el diálogo pide confirmar y al
// aceptar la cuenta desaparece: ya no se encuentra y no puede iniciar sesión. Administrador: uno nuevo.
Env.prepareData()
Map admin = Users.createAdmin('borrar')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/admins/delete')
	Users.searchByDocument(admin.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Eliminar'), 30)
	WebUI.click(Users.resultButton('Eliminar'))

	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-confirm'), 30)
	Ui.verifyContains(WebUI.getText(Packages.xpath("//*[@role='dialog' or @role='alertdialog']", 'dialogo')), admin.fullName)
	Ui.verifyContains(WebUI.getText(Packages.xpath("//*[@role='dialog' or @role='alertdialog']", 'dialogo')), 'Esta acción es permanente')
	Ui.evidence('TC-HU008-01_dialogo')
	WebUI.click(Ui.byTestId('confirm-dialog-confirm'))

	Packages.verifyMessage('Administrador eliminado correctamente.')
	Ui.verifyAlert('No se encontró ningún administrador con ese documento.')
	Ui.evidence('TC-HU008-01_eliminado')

	Ui.verifyEquals('la cuenta ya no está en la base', Users.userColumn('estado', admin.email) == null, true)
	Ui.verifyEquals('HTTP login del administrador eliminado', Api.loginStatus(admin.email, admin.password), 401)
}
finally {
	WebUI.closeBrowser()
}
