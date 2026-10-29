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

// TC-HU002-01: con un correo registrado, la pantalla muestra "Revisa tu correo" y a la bandeja llega el correo con el
// enlace de recuperación. Cuenta: un mensajero nuevo.
Env.prepareData()
Map courier = Users.createCourier('recup')
Ui.requestRecovery(courier.email)
try {
	Ui.verifyContains(WebUI.getText(Ui.byTestId('recovery-email-sent')), 'Revisa tu correo')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('recovery-email-sent')), courier.email)
	Ui.evidence('TC-HU002-01_revisa_tu_correo')

	Map message = Mail.waitForMessage(courier.email, 1, 40, Mail.SUBJECT_RECOVERY)
	Ui.verifyEquals('asunto del correo', message.Subject, 'BlawdTrack: enlace de recuperación')
	Ui.verifyContains(Mail.recoveryLink(courier.email), '/recovery?token=')
}
finally {
	WebUI.closeBrowser()
}
