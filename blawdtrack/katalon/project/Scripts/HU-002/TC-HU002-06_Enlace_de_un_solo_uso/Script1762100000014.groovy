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

// TC-HU002-06: el enlace queda invalidado al usarse: abrirlo otra vez y mandar una contraseña muestra "Enlace no
// válido" y no cambia nada. Cuenta: un mensajero nuevo.
Env.prepareData()
Map courier = Users.createCourier('recup')
String firstPassword = 'Nueva2026x'
Ui.requestRecovery(courier.email)
try {
	String link = Mail.recoveryLink(courier.email)
	Ui.openRecoveryLink(link)
	Ui.typeNewPassword(firstPassword, firstPassword)
	WebUI.click(Ui.byTestId('new-password-submit'))
	WebUI.waitForElementPresent(Ui.byTestId('new-password-success'), 30)

	Ui.openRecoveryLink(link)
	Ui.typeNewPassword('Otra2026xyz', 'Otra2026xyz')
	WebUI.click(Ui.byTestId('new-password-submit'))
	WebUI.waitForElementPresent(Ui.byTestId('new-password-invalid-link'), 30)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('new-password-invalid-link')), 'Enlace no válido')
	Ui.evidence('TC-HU002-06_enlace_ya_usado')

	Ui.verifyEquals('HTTP login con la primera contraseña', Api.loginStatus(courier.email, firstPassword), 200)
	Ui.verifyEquals('HTTP login con la segunda contraseña', Api.loginStatus(courier.email, 'Otra2026xyz'), 401)
}
finally {
	WebUI.closeBrowser()
}
