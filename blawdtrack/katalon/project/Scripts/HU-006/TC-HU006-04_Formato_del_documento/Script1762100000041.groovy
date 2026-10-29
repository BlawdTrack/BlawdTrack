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

// TC-HU006-04: el documento debe tener el formato de su tipo: con una cédula de 8 dígitos la pantalla avisa y la API
// responde 400; con una de 9 dígitos se acepta.
Env.prepareData()
Map invalid = Users.adminData('doc')
invalid.documentNumber = '12345678'
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openAdminForm()
	Users.fillAdminForm(invalid)
	WebUI.click(Ui.byTestId('form-submit'))
	Ui.verifyFieldError('Ingresa un número de documento válido para el tipo seleccionado.')
	Ui.verifyUrl('.*/main-menu/admins/new$')
	Ui.evidence('TC-HU006-04_documento_invalido')
}
finally {
	WebUI.closeBrowser()
}
String token = Api.superToken()
Ui.verifyEquals('HTTP POST /api/v1/admins con cédula de 8 dígitos', Api.call('POST', '/api/v1/admins', token, Users.adminJson(invalid)).status, 400)
Ui.verifyEquals('HTTP POST /api/v1/admins con cédula de 9 dígitos', Api.call('POST', '/api/v1/admins', token, Users.adminJson(Users.adminData('doc'))).status, 201)
