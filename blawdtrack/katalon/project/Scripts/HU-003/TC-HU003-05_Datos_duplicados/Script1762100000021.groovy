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

// TC-HU003-05: no se puede registrar a otro mensajero con la misma cédula, correo o teléfono. La pantalla marca el correo
// repetido y la API responde 409 (COURIER_CONFLICT) en los tres casos.
Env.prepareData()
Map existing = Users.createCourier('dup')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Map other = Users.courierData('dup')
	other.email = existing.email
	Users.openCourierForm()
	Users.fillCourierForm(other)
	WebUI.click(Ui.byTestId('form-submit'))
	Ui.verifyFieldError('Este correo electrónico ya está registrado.')
	Ui.evidence('TC-HU003-05_correo_repetido')

	String token = Api.superToken()
	Map sameDocument = Users.courierData('dup')
	sameDocument.documentNumber = existing.documentNumber
	Ui.verifyEquals('HTTP con la misma cédula', Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(sameDocument)).status, 409)
	Map samePhone = Users.courierData('dup')
	samePhone.phone = existing.phone
	Ui.verifyEquals('HTTP con el mismo teléfono', Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(samePhone)).status, 409)
	Map sameEmail = Users.courierData('dup')
	sameEmail.email = existing.email
	Ui.verifyEquals('HTTP con el mismo correo', Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(sameEmail)).status, 409)
}
finally {
	WebUI.closeBrowser()
}
