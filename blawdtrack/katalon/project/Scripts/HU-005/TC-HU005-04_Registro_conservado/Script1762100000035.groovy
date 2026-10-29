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

// TC-HU005-04: desactivar es lógico: el mensajero desactivado sigue en el sistema con su registro y sus datos, solo
// que Inactivo, y se puede encontrar en "Actualizar mensajero".
Env.prepareData()
Map courier = Users.createCourier('desact')
Users.deactivateCourier(courier)
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/editar-mensajero')
	Users.searchByDocument(courier.documentNumber)
	Packages.verifyPageText(courier.fullName)
	Packages.verifyPageText('Inactivo')
	Ui.evidence('TC-HU005-04_registro_conservado')
	Ui.verifyEquals('cuentas con ese correo en la base', Users.userColumn('COUNT(*)', courier.email), '1')
}
finally {
	WebUI.closeBrowser()
}
