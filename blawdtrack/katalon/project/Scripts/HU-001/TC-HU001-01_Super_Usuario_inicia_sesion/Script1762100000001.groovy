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

// TC-HU001-01: el Super Usuario entra con su correo y contraseña y llega al menú principal, donde ve todos los módulos.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Ui.verifyUrl('.*/main-menu$')
	Ui.verifyNavLink('/main-menu/paquetes/importar', true)
	Ui.verifyNavLink('/main-menu/couriers/new', true)
	Ui.verifyNavLink('/main-menu/admins/new', true)
	Ui.verifyNavLink('/gestion-roles', true)
	Ui.evidence('TC-HU001-01_super_usuario')
}
finally {
	WebUI.closeBrowser()
}
