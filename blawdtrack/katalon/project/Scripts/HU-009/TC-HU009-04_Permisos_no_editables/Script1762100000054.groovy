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

// TC-HU009-04: algunos permisos del rol no se pueden modificar: su casilla está bloqueada y la etiqueta dice "no editable".
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000001')
	TestObject locked = Users.permissionBox('Validar la importación de paquetes')
	Ui.verifyEquals('etiqueta', Users.permissionState('Validar la importación de paquetes'), 'Validar la importación de paquetes: permitido, no editable')
	Ui.verifyEquals('casilla bloqueada', WebUI.getAttribute(locked, 'disabled') != null, true)
	Ui.evidence('TC-HU009-04_permiso_no_editable')
}
finally {
	WebUI.closeBrowser()
}
