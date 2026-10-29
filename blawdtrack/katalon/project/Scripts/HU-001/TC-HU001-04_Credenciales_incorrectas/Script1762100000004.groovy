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

// TC-HU001-04: con una contraseña incorrecta la pantalla avisa y no entra. El mensaje no revela qué dato falló: la API
// responde igual (401, mismo código y mismo mensaje) con una contraseña mala que con un correo que no existe.
Env.prepareData()
Ui.loginAttempt(GlobalVariable.salesEmail, 'ContrasenaMala1')
try {
	Ui.verifyAlert('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.')
	Ui.verifyUrl('.*/login$')
	Ui.evidence('TC-HU001-04_credenciales_incorrectas')

	Ui.verifyEquals('HTTP login con contraseña incorrecta', Api.loginStatus(GlobalVariable.salesEmail, 'ContrasenaMala1'), 401)
	Ui.verifyEquals('HTTP login con correo inexistente', Api.loginStatus('no.existe@blawdgourmet.test', 'ContrasenaMala1'), 401)
	Map wrongPassword = Api.loginError(GlobalVariable.salesEmail, 'ContrasenaMala1')
	Map unknownEmail = Api.loginError('no.existe@blawdgourmet.test', 'ContrasenaMala1')
	Ui.verifyEquals('código de error', wrongPassword.code, unknownEmail.code)
	Ui.verifyEquals('mensaje de error', wrongPassword.message, unknownEmail.message)
}
finally {
	WebUI.closeBrowser()
}
