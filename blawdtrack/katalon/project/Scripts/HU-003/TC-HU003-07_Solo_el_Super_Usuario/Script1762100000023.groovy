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

// TC-HU003-07: solo el Super Usuario registra mensajeros. Ventas y Mensajero no ven la opción, la ruta los devuelve a su
// inicio y la API responde 403.
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyNavLink('/main-menu/couriers/new', false)
	Ui.goTo('/main-menu/couriers/new')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU003-07_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
String body = groovy.json.JsonOutput.toJson(Users.courierData('sinpermiso'))
Ui.verifyEquals('HTTP POST /api/v1/couriers como Administrador de Ventas', Api.call('POST', '/api/v1/couriers', Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword), body).status, 403)
Ui.verifyEquals('HTTP POST /api/v1/couriers como Mensajero', Api.call('POST', '/api/v1/couriers', Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword), body).status, 403)
