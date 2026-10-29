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

// TC-HU006-05: no se crea a otro administrador con el mismo correo (la pantalla lo marca) ni con el mismo documento
// (la API responde 409).
Env.prepareData()
Map existing = Users.createAdmin('dup')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Map other = Users.adminData('dup')
	other.email = existing.email
	Users.openAdminForm()
	Users.fillAdminForm(other)
	WebUI.click(Ui.byTestId('form-submit'))
	Ui.verifyFieldError('Este correo electrónico ya está registrado.')
	Ui.evidence('TC-HU006-05_correo_repetido')
}
finally {
	WebUI.closeBrowser()
}
Map sameDocument = Users.adminData('dup')
sameDocument.documentNumber = existing.documentNumber
Ui.verifyEquals('HTTP con el mismo documento', Api.call('POST', '/api/v1/admins', Api.superToken(), Users.adminJson(sameDocument)).status, 409)
