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

// TC-HU001-07: "Cerrar sesión" lleva al inicio de sesión y, con la sesión cerrada, las rutas protegidas ya no abren.
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyUrl('.*/main-menu$')
	Ui.logout()
	Ui.verifyUrl('.*/login$')
	Ui.evidence('TC-HU001-07_sesion_cerrada')

	Ui.goTo('/main-menu')
	Ui.verifyUrl('.*/login$')
	Ui.goTo('/main-menu/paquetes/buscar')
	Ui.verifyUrl('.*/login$')
}
finally {
	WebUI.closeBrowser()
}
