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

// TC-HU002-07: el enlace vence a los 15 minutos. Para no esperar, la prueba adelanta la fecha de expiración en la base
// del entorno de pruebas: con el enlace vencido aparece "Enlace no válido" y la contraseña no cambia.
Env.prepareData()
Map courier = Users.createCourier('recup')
Ui.requestRecovery(courier.email)
try {
	String link = Mail.recoveryLink(courier.email)
	Packages.query("UPDATE tokens_recuperacion_contrasena SET fecha_expiracion = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = '" + courier.email + "')")

	Ui.openRecoveryLink(link)
	Ui.typeNewPassword('Nueva2026x', 'Nueva2026x')
	WebUI.click(Ui.byTestId('new-password-submit'))
	WebUI.waitForElementPresent(Ui.byTestId('new-password-invalid-link'), 30)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('new-password-invalid-link')), 'ya expiró')
	Ui.evidence('TC-HU002-07_enlace_vencido')

	Ui.verifyEquals('HTTP login con la contraseña anterior', Api.loginStatus(courier.email, courier.password), 200)
}
finally {
	WebUI.closeBrowser()
}
