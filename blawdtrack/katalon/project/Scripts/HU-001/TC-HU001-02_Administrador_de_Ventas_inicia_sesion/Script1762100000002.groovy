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

// TC-HU001-02: el Administrador de Ventas llega al menú principal y solo ve los módulos de paquetes (no ve los de
// mensajeros, administradores ni roles).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.verifyUrl('.*/main-menu$')
	Ui.verifyNavLink('/main-menu/paquetes/importar', true)
	Ui.verifyNavLink('/main-menu/paquetes/buscar', true)
	Ui.verifyNavLink('/main-menu/couriers/new', false)
	Ui.verifyNavLink('/main-menu/admins/new', false)
	Ui.verifyNavLink('/gestion-roles', false)
	Ui.evidence('TC-HU001-02_administrador_de_ventas')
}
finally {
	WebUI.closeBrowser()
}
