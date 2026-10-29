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

// TC-HU009-06: el rol Mensajero tiene su propia matriz: consultar los paquetes asignados, actualizar su estado y registrar
// los costos del viaje.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000002')
	Packages.verifyPageText('Mensajero')
	Ui.verifyEquals('Consultar paquetes asignados', Users.permissionState('Consultar paquetes asignados'), 'Consultar paquetes asignados: permitido')
	Ui.verifyEquals('Actualizar estado de paquetes', Users.permissionState('Actualizar estado de paquetes'), 'Actualizar estado de paquetes: permitido')
	Ui.verifyEquals('Registrar costos del viaje', Users.permissionState('Registrar costos del viaje'), 'Registrar costos del viaje: permitido')
	Ui.evidence('TC-HU009-06_permisos_del_mensajero')
}
finally {
	WebUI.closeBrowser()
}
