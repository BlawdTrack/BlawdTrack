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

// TC-HU002-04: con el enlace del correo se define una contraseña nueva (8 caracteres o más, con letras y números): la
// pantalla confirma, la cuenta entra con la nueva y ya no con la anterior. Cuenta: un mensajero nuevo.
Env.prepareData()
Map courier = Users.createCourier('recup')
String newPassword = 'Nueva2026x'
Ui.requestRecovery(courier.email)
try {
	String link = Mail.recoveryLink(courier.email)
	Ui.openRecoveryLink(link)
	Ui.typeNewPassword(newPassword, newPassword)
	Ui.verifyNewPasswordSubmitDisabled('contraseña válida', false)
	WebUI.click(Ui.byTestId('new-password-submit'))

	WebUI.waitForElementPresent(Ui.byTestId('new-password-success'), 30)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('new-password-success')), 'Contraseña actualizada')
	Ui.evidence('TC-HU002-04_contrasena_actualizada')

	Ui.verifyEquals('HTTP login con la contraseña nueva', Api.loginStatus(courier.email, newPassword), 200)
	Ui.verifyEquals('HTTP login con la contraseña anterior', Api.loginStatus(courier.email, courier.password), 401)

	// "Ir a iniciar sesión" lleva al login y la cuenta entra con la nueva contraseña.
	WebUI.click(Ui.byTestId('new-password-go-login'))
	WebUI.waitForElementPresent(Ui.byTestId('login-submit'), 30)
	WebUI.setText(Ui.css('#login-email'), courier.email)
	WebUI.setText(Ui.css('#login-password'), newPassword)
	WebUI.click(Ui.byTestId('login-submit'))
	Ui.verifyUrl('.*/mensajero$')
}
finally {
	WebUI.closeBrowser()
}
