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

// TC-HU004-01: el Super Usuario busca a un mensajero por su documento y al abrirlo el formulario trae sus datos
// actuales. Mensajero: uno nuevo creado por la API.
Env.prepareData()
Map courier = Users.createCourier('edit')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(courier.documentNumber)
	Ui.verifyEquals('nombre completo', Ui.valueOf('fullName'), courier.fullName)
	Ui.verifyEquals('correo', Ui.valueOf('email'), courier.email)
	Ui.verifyEquals('teléfono', Ui.valueOf('phone'), courier.phone)
	Ui.evidence('TC-HU004-01_formulario_de_edicion')
}
finally {
	WebUI.closeBrowser()
}
