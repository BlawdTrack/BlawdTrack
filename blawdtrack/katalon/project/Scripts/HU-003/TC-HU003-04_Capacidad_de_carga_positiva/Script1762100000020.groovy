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

// TC-HU003-04: la capacidad máxima de carga debe ser un número positivo: la API rechaza 0 y los negativos (400) y acepta
// un valor positivo. En la pantalla la rueda de capacidad empieza en 1 kg.
Env.prepareData()
String token = Api.superToken()
for (int weight : [0, -3]) {
	Map courier = Users.courierData('peso')
	courier.maxPackageWeightKg = weight
	Ui.verifyEquals('HTTP POST /api/v1/couriers con capacidad ' + weight, Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(courier)).status, 400)
}
Map valid = Users.courierData('peso')
Ui.verifyEquals('HTTP POST /api/v1/couriers con capacidad 20', Api.call('POST', '/api/v1/couriers', token, groovy.json.JsonOutput.toJson(valid)).status, 201)
