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

// TC-HU006-07: solo el Super Usuario crea administradores. Ventas y Mensajero reciben 403 en la API y Ventas no ve la
// opción ni entra por la ruta.
Env.prepareData()
String body = Users.adminJson(Users.adminData('sinpermiso'))
Ui.verifyEquals('HTTP POST como Administrador de Ventas', Api.call('POST', '/api/v1/admins', Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword), body).status, 403)
Ui.verifyEquals('HTTP POST como Mensajero', Api.call('POST', '/api/v1/admins', Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword), body).status, 403)
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyNavLink('/main-menu/admins/new', false)
	Ui.goTo('/main-menu/admins/new')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU006-07_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
