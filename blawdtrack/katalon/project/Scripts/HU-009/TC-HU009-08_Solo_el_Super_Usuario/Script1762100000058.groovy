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

// TC-HU009-08: solo el Super Usuario asigna o modifica permisos. Ventas y Mensajero reciben 403 en la API y Ventas no ve
// la opción ni entra por la ruta.
Env.prepareData()
String path = '/api/v1/users/CEDULA/900000002/permissions'
Ui.verifyEquals('HTTP PUT como Administrador de Ventas', Api.call('PUT', path, Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword), '{"permissionCodes":[]}').status, 403)
Ui.verifyEquals('HTTP PUT como Mensajero', Api.call('PUT', path, Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword), '{"permissionCodes":[]}').status, 403)
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyNavLink('/gestion-roles', false)
	Ui.goTo('/gestion-roles')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU009-08_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
