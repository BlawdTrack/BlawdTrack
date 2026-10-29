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

// TC-HU009-02: se quita "Importar paquetes" al Administrador de Ventas y se aplican los cambios: la pantalla avisa que
// aplicarán en la siguiente solicitud y la API le responde 403 al importar. Al terminar se restablecen sus permisos.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000001')
	WebUI.click(Users.permissionBox('Importar paquetes'))
	Ui.verifyEquals('estado del permiso en la pantalla', Users.permissionState('Importar paquetes'), 'Importar paquetes: denegado')
	WebUI.click(Ui.buttonByText('Aplicar cambios'))
	Packages.verifyMessage('Los permisos se aplicarán en la siguiente solicitud del usuario.')
	Ui.evidence('TC-HU009-02_permiso_quitado')

	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP POST /api/v1/packages/import/preview sin el permiso', Api.statusOf('POST', '/api/v1/packages/import/preview', token, '{}'), 403)
}
finally {
	WebUI.closeBrowser()
	Users.resetSalesPermissions()
}
