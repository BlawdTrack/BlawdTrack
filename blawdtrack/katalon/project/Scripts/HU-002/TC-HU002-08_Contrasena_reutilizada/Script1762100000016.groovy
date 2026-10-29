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

// TC-HU002-08: no se acepta una contraseña igual a la actual ni a las últimas usadas. Cuenta: un mensajero nuevo; se
// cambia la contraseña una vez y luego se intenta volver a poner la misma con un segundo enlace.
Env.prepareData()
Map courier = Users.createCourier('recup')
String password = 'Nueva2026x'
Ui.requestRecovery(courier.email)
try {
	Ui.openRecoveryLink(Mail.recoveryLink(courier.email))
	Ui.typeNewPassword(password, password)
	WebUI.click(Ui.byTestId('new-password-submit'))
	WebUI.waitForElementPresent(Ui.byTestId('new-password-success'), 30)

	// Segundo enlace: el correo número 2 que recibe la cuenta.
	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/password-recovery')
	WebUI.waitForElementPresent(Ui.byTestId('recovery-submit'), 30)
	WebUI.setText(Ui.css('#recovery-email'), courier.email)
	WebUI.click(Ui.byTestId('recovery-submit'))
	WebUI.waitForElementPresent(Ui.byTestId('recovery-email-sent'), 30)

	Ui.openRecoveryLink(Mail.recoveryLink(courier.email, 2))
	Ui.typeNewPassword(password, password)
	WebUI.click(Ui.byTestId('new-password-submit'))
	Ui.verifyAlert('No puedes reutilizar ninguna de tus últimas 3 contraseñas')
	Ui.evidence('TC-HU002-08_contrasena_reutilizada')
}
finally {
	WebUI.closeBrowser()
}
