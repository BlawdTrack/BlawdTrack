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

// TC-HU009-01: el Super Usuario busca al Administrador de Ventas por su documento y ve la matriz de permisos de su rol,
// con los permisos que tiene permitidos de fábrica.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000001')
	Packages.verifyPageText('Administrador de Ventas')
	Ui.verifyEquals('Importar paquetes', Users.permissionState('Importar paquetes'), 'Importar paquetes: permitido')
	Ui.verifyEquals('Buscar paquetes', Users.permissionState('Buscar paquetes'), 'Buscar paquetes: permitido')
	Ui.verifyEquals('Eliminar paquetes', Users.permissionState('Eliminar paquetes'), 'Eliminar paquetes: permitido')
	Ui.evidence('TC-HU009-01_matriz_de_permisos')
}
finally {
	WebUI.closeBrowser()
}
