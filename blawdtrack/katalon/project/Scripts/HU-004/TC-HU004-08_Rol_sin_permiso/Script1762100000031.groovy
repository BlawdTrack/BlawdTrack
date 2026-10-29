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

// TC-HU004-08: solo el Super Usuario edita mensajeros. Ventas y Mensajero no pueden (403 en la API) y la ruta de la
// pantalla devuelve a Ventas a su inicio.
Env.prepareData()
Map courier = Users.createCourier('edit')
String path = '/api/v1/couriers/' + courier.id
String body = groovy.json.JsonOutput.toJson([fullName: courier.fullName, email: courier.email, phone: courier.phone, schedule: courier.schedule, maxPackageWeightKg: 25])
Ui.verifyEquals('HTTP PUT como Administrador de Ventas', Api.call('PUT', path, Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword), body).status, 403)
Ui.verifyEquals('HTTP PUT como Mensajero', Api.call('PUT', path, Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword), body).status, 403)
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.goTo('/editar-mensajero')
	Ui.verifyUrl('.*/main-menu$')
	Ui.verifyNavLink('/editar-mensajero', false)
	Ui.evidence('TC-HU004-08_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
