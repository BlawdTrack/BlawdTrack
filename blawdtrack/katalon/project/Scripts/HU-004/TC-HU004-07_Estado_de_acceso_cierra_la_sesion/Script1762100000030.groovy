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

// TC-HU004-07: poner al mensajero en estado Inactivo avisa que su sesión se cerrará de inmediato; al guardar, la sesión
// que tenía abierta deja de valer y ya no puede iniciar sesión (403).
Env.prepareData()
Map courier = Users.createCourier('edit')
String token = Api.tokenFor(courier.email, courier.password)
Ui.verifyEquals('HTTP GET /api/v1/auth/session con la sesión abierta', Api.statusOf('GET', '/api/v1/auth/session', token), 204)
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(courier.documentNumber)
	WebUI.click(Ui.css("input[aria-label='Estado de acceso']", 'estado-de-acceso'))
	Packages.verifyMessage('La sesión activa del mensajero se cerrará de inmediato.')
	WebUI.click(Ui.byTestId('edit-save'))
	Packages.verifyMessage('Notificación de actualización exitosa. Los datos del mensajero han sido modificados.')
	Ui.evidence('TC-HU004-07_estado_inactivo')

	Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', courier.email), 'INACTIVE')
	Ui.verifyEquals('HTTP GET /api/v1/auth/session tras guardar', Api.statusOf('GET', '/api/v1/auth/session', token), 401)
	Ui.verifyEquals('HTTP login tras guardar', Api.loginStatus(courier.email, courier.password), 403)
}
finally {
	WebUI.closeBrowser()
}
