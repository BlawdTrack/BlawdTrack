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

// TC-HU006-02: el administrador recibe un correo de bienvenida con su contraseña temporal y con ella entra con el rol
// Administrador de Ventas.
Env.prepareData()
Map admin = Users.adminData('bienvenida')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.registerAdminThroughUi(admin)

	Map message = Mail.waitForMessage(admin.email, 1, 40, Mail.SUBJECT_WELCOME)
	Ui.verifyEquals('asunto del correo', message.Subject, 'BlawdTrack: bienvenida y credenciales de acceso')
	String temporaryPassword = Mail.temporaryPassword(admin.email)
	Ui.verifyContains(Mail.textOf(message), 'administrador de ventas')

	Ui.verifyEquals('HTTP login con la contraseña temporal', Api.loginStatus(admin.email, temporaryPassword), 200)
	Ui.verifyEquals('rol al iniciar sesión', Api.call('POST', '/api/v1/auth/login', null,
			groovy.json.JsonOutput.toJson([email: admin.email, password: temporaryPassword])).body.role, 'ADMIN_VENTAS')
	Ui.evidence('TC-HU006-02_administrador_creado')
}
finally {
	WebUI.closeBrowser()
}
