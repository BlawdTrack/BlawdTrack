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

// TC-HU006-01: el Super Usuario crea un administrador con nombre, correo, teléfono y documento: la pantalla avisa que se
// creó y se envió el correo, vuelve al menú de administradores y la cuenta queda Activa con el rol Administrador de Ventas.
Env.prepareData()
Map admin = Users.adminData('nuevo')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.registerAdminThroughUi(admin)
	Ui.verifyUrl('.*/main-menu/administradores$')
	Ui.evidence('TC-HU006-01_administrador_creado')

	Ui.verifyEquals('estado de la cuenta', Users.userColumn('estado', admin.email), 'ACTIVE')
	Ui.verifyEquals('rol de la cuenta', Users.roleOf(admin.email), 'ADMIN_VENTAS')
}
finally {
	WebUI.closeBrowser()
}
