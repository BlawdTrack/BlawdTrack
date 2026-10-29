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

// TC-HU003-02: al registrar al mensajero le llega un correo de bienvenida con su contraseña temporal, y con ese correo y
// esa contraseña entra al sistema con el rol Mensajero.
Env.prepareData()
Map courier = Users.courierData('bienvenida')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.registerCourierThroughUi(courier)

	Map message = Mail.waitForMessage(courier.email)
	Ui.verifyEquals('asunto del correo', message.Subject, 'BlawdTrack: bienvenida y credenciales de acceso')
	String temporaryPassword = Mail.temporaryPassword(courier.email)
	Ui.verifyContains(Mail.textOf(message), courier.email)

	Ui.verifyEquals('HTTP login con la contraseña temporal', Api.loginStatus(courier.email, temporaryPassword), 200)
	Ui.verifyEquals('rol al iniciar sesión', Api.call('POST', '/api/v1/auth/login', null,
			groovy.json.JsonOutput.toJson([email: courier.email, password: temporaryPassword])).body.role, 'MENSAJERO')
	Ui.evidence('TC-HU003-02_mensajero_creado')
}
finally {
	WebUI.closeBrowser()
}
