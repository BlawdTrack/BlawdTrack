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

// TC-HU002-05: la contraseña nueva exige 8 caracteres o más con letras y números y coincidir con su confirmación; con
// cualquiera de esas faltas el botón "Guardar nueva contraseña" queda bloqueado. Cuenta: un mensajero nuevo.
Env.prepareData()
Map courier = Users.createCourier('recup')
Ui.requestRecovery(courier.email)
try {
	Ui.openRecoveryLink(Mail.recoveryLink(courier.email))

	Ui.typeNewPassword('abc', 'abc')
	Ui.verifyNewPasswordSubmitDisabled('menos de 8 caracteres', true)
	Ui.evidence('TC-HU002-05_clave_corta')

	Ui.typeNewPassword('12345678', '12345678')
	Ui.verifyNewPasswordSubmitDisabled('solo números', true)

	Ui.typeNewPassword('abcdefgh', 'abcdefgh')
	Ui.verifyNewPasswordSubmitDisabled('solo letras', true)

	Ui.typeNewPassword('Nueva2026x', 'Otra2026xx')
	Ui.verifyNewPasswordSubmitDisabled('confirmación distinta', true)

	Ui.typeNewPassword('Nueva2026x', 'Nueva2026x')
	Ui.verifyNewPasswordSubmitDisabled('contraseña válida', false)
	Ui.evidence('TC-HU002-05_clave_valida')
}
finally {
	WebUI.closeBrowser()
}
