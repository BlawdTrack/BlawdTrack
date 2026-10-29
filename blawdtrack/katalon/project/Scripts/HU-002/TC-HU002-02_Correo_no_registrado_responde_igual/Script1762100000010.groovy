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

// TC-HU002-02: con un correo que no existe, la pantalla responde igual que con uno registrado (así no se puede saber
// qué correos existen) y no sale ningún correo.
Env.prepareData()
String email = 'kat.noexiste.' + Users.suffix() + '@blawdgourmet.test'
Ui.requestRecovery(email)
try {
	Ui.verifyContains(WebUI.getText(Ui.byTestId('recovery-email-sent')), 'Revisa tu correo')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('recovery-email-sent')), 'está registrado y activo')
	Ui.evidence('TC-HU002-02_correo_no_registrado')

	WebUI.delay(6)
	Ui.verifyEquals('correos enviados a ' + email, Mail.countTo(email, Mail.SUBJECT_RECOVERY), 0)
}
finally {
	WebUI.closeBrowser()
}
