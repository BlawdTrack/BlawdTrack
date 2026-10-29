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

// TC-HU003-06: el número de documento debe tener el formato de su tipo: una cédula de 8 dígitos o con letras se rechaza
// (400) y una de 9 dígitos se acepta.
Env.prepareData()
String token = Api.superToken()
for (String invalid : ['12345678', '12ABC4567']) {
	Map courier = Users.courierData('doc')
	courier.documentNumber = invalid
	Ui.verifyEquals('HTTP POST /api/v1/couriers con cédula ' + invalid, Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(courier)).status, 400)
}
Map valid = Users.courierData('doc')
Ui.verifyEquals('HTTP POST /api/v1/couriers con cédula ' + valid.documentNumber, Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(valid)).status, 201)
