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

// TC-HU008-06: solo el Super Usuario elimina administradores. Ventas y Mensajero reciben 403 en la API, el administrador
// sigue existiendo y Ventas no ve la opción ni entra por la ruta.
Env.prepareData()
Map admin = Users.createAdmin('borrar')
String path = '/api/v1/admins/CEDULA/' + admin.documentNumber
Ui.verifyEquals('HTTP DELETE como Administrador de Ventas', Api.call('DELETE', path, Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)).status, 403)
Ui.verifyEquals('HTTP DELETE como Mensajero', Api.call('DELETE', path, Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword)).status, 403)
Ui.verifyEquals('HTTP login del administrador', Api.loginStatus(admin.email, admin.password), 200)
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyNavLink('/main-menu/admins/delete', false)
	Ui.goTo('/main-menu/admins/delete')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU008-06_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
