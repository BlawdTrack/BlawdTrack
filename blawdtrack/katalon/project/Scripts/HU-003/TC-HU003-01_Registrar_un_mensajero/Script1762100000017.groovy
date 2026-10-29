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

// TC-HU003-01: el Super Usuario registra un mensajero con todos sus datos: la pantalla avisa que se creó y se envió el
// correo, vuelve al menú de mensajeros, y la cuenta queda Activa con el rol Mensajero y aparece en "Actualizar mensajero".
Env.prepareData()
Map courier = Users.courierData('nuevo')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.registerCourierThroughUi(courier)
	Ui.verifyUrl('.*/main-menu/mensajeros$')
	Ui.evidence('TC-HU003-01_mensajero_creado')

	Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', courier.email), 'ACTIVE')
	Ui.verifyEquals('rol de la cuenta', Users.roleOf(courier.email), 'MENSAJERO')

	Users.openSearchPage('/editar-mensajero')
	Users.searchByDocument(courier.documentNumber)
	Packages.verifyPageText(courier.fullName)
	Packages.verifyPageText(courier.documentNumber)
}
finally {
	WebUI.closeBrowser()
}
