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

// TC-HU002-03: una cuenta inactiva ve la misma pantalla "Revisa tu correo" (no se revela su estado) pero no recibe el
// correo. Cuenta: un mensajero nuevo que se desactiva por la API.
Env.prepareData()
Map courier = Users.createCourier('recupinac')
Users.deactivateCourier(courier)
Ui.requestRecovery(courier.email)
try {
	Ui.verifyContains(WebUI.getText(Ui.byTestId('recovery-email-sent')), 'Revisa tu correo')
	Ui.evidence('TC-HU002-03_cuenta_inactiva')

	WebUI.delay(6)
	Ui.verifyEquals('correos enviados a la cuenta inactiva', Mail.countTo(courier.email, Mail.SUBJECT_RECOVERY), 0)
}
finally {
	WebUI.closeBrowser()
}
