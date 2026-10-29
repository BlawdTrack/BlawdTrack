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

// TC-HU001-05: una cuenta desactivada no entra y la pantalla avisa que está inactiva (la API responde 403
// ACCOUNT_INACTIVE). Cuenta: un mensajero nuevo que se desactiva por la API.
Env.prepareData()
Map courier = Users.createCourier('inactivo')
Users.deactivateCourier(courier)
Ui.loginAttempt(courier.email, courier.password)
try {
	Ui.verifyAlert('Tu cuenta está inactiva. Contacta a un administrador de BlawdTrack para reactivarla.')
	Ui.verifyUrl('.*/login$')
	Ui.evidence('TC-HU001-05_cuenta_inactiva')

	Ui.verifyEquals('HTTP login de la cuenta inactiva', Api.loginStatus(courier.email, courier.password), 403)
	Ui.verifyEquals('código de error', Api.loginError(courier.email, courier.password).code, 'ACCOUNT_INACTIVE')
}
finally {
	WebUI.closeBrowser()
}
