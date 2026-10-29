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

// TC-HU004-04: al editar, la capacidad máxima de carga debe seguir siendo un número positivo: la API rechaza 0 y los
// negativos (400) y acepta un valor positivo.
Env.prepareData()
Map courier = Users.createCourier('edit')
String token = Api.superToken()
String path = '/api/v1/couriers/' + courier.id
for (int weight : [0, -3]) {
	Ui.verifyEquals('HTTP PUT ' + path + ' con capacidad ' + weight, Api.call('PUT', path, token, groovy.json.JsonOutput.toJson(
			[fullName: courier.fullName, email: courier.email, phone: courier.phone, schedule: courier.schedule, maxPackageWeightKg: weight])).status, 400)
}
Ui.verifyEquals('HTTP PUT ' + path + ' con capacidad 25', Api.call('PUT', path, token, groovy.json.JsonOutput.toJson(
		[fullName: courier.fullName, email: courier.email, phone: courier.phone, schedule: courier.schedule, maxPackageWeightKg: 25])).status, 200)
