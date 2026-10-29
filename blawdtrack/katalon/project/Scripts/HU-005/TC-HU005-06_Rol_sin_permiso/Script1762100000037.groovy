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

// TC-HU005-06: solo el Super Usuario desactiva mensajeros. Ventas y Mensajero reciben 403 en la API, la cuenta sigue Activa
// y Ventas no ve la opción ni entra por la ruta.
Env.prepareData()
Map courier = Users.createCourier('desact')
String path = '/api/v1/couriers/' + courier.id + '/deactivate'
Ui.verifyEquals('HTTP PATCH como Administrador de Ventas', Api.call('PATCH', path, Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)).status, 403)
Ui.verifyEquals('HTTP PATCH como Mensajero', Api.call('PATCH', path, Api.tokenFor(GlobalVariable.courierEmail, GlobalVariable.courierPassword)).status, 403)
Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', courier.email), 'ACTIVE')
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyNavLink('/main-menu/couriers/deactivate', false)
	Ui.goTo('/main-menu/couriers/deactivate')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU005-06_ventas_sin_acceso')
}
finally {
	WebUI.closeBrowser()
}
