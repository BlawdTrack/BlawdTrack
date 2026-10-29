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

// TC-HU001-03: el Mensajero llega a su propio inicio (/mensajero) y el menú no le ofrece paquetes ni administración.
Env.prepareData()
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	Ui.verifyUrl('.*/mensajero$')
	Ui.verifyNavLink('/main-menu/paquetes/importar', false)
	Ui.verifyNavLink('/main-menu/paquetes/buscar', false)
	Ui.verifyNavLink('/main-menu/couriers/new', false)
	Ui.verifyNavLink('/gestion-roles', false)
	Ui.evidence('TC-HU001-03_mensajero')
}
finally {
	WebUI.closeBrowser()
}
