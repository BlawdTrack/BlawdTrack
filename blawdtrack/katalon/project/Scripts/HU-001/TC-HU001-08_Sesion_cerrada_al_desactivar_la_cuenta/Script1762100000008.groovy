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

// TC-HU001-08: cuando se desactiva una cuenta, su sesión abierta deja de valer en la siguiente solicitud (el token ya
// no se acepta). Cuenta: un mensajero nuevo.
Env.prepareData()
Map courier = Users.createCourier('sesion')
String token = Api.tokenFor(courier.email, courier.password)
Ui.verifyEquals('HTTP GET /api/v1/auth/session con la sesión abierta', Api.statusOf('GET', '/api/v1/auth/session', token), 204)

Users.deactivateCourier(courier)
Ui.verifyEquals('HTTP GET /api/v1/auth/session tras desactivar la cuenta', Api.statusOf('GET', '/api/v1/auth/session', token), 401)
Ui.verifyEquals('HTTP login tras desactivar la cuenta', Api.loginStatus(courier.email, courier.password), 403)
