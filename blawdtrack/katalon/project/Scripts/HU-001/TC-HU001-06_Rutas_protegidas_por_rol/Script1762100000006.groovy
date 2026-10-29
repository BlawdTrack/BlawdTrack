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

// TC-HU001-06: cada rol solo entra a lo suyo. Sin sesión, cualquier ruta del sistema lleva al inicio de sesión; con
// sesión, una ruta ajena devuelve a la persona a su propio inicio (Ventas a /main-menu y Mensajero a /mensajero).
Env.prepareData()

// Sin sesión.
WebUI.openBrowser('')
WebUI.maximizeWindow()
try {
	Ui.goTo('/gestion-roles')
	Ui.verifyUrl('.*/login$')
	Ui.goTo('/main-menu')
	Ui.verifyUrl('.*/login$')
}
finally {
	WebUI.closeBrowser()
}

// Administrador de Ventas.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.goTo('/gestion-roles')
	Ui.verifyUrl('.*/main-menu$')
	Ui.goTo('/main-menu/couriers/new')
	Ui.verifyUrl('.*/main-menu$')
	Ui.evidence('TC-HU001-06_ventas_ruta_ajena')
}
finally {
	WebUI.closeBrowser()
}

// Mensajero.
Ui.login(GlobalVariable.courierEmail, GlobalVariable.courierPassword)
try {
	Ui.goTo('/gestion-roles')
	Ui.verifyUrl('.*/mensajero$')
	Ui.goTo('/main-menu/paquetes/importar')
	Ui.verifyUrl('.*/mensajero$')
	Ui.evidence('TC-HU001-06_mensajero_ruta_ajena')
}
finally {
	WebUI.closeBrowser()
}
