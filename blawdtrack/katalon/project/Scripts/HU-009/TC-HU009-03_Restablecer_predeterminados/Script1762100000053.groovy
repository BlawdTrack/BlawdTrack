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

// TC-HU009-03: "Restablecer predeterminados" devuelve los permisos de fábrica del rol: la pantalla avisa, la casilla vuelve a
// "permitido" y la API ya no responde 403 al importar (responde un error de formato, porque la prueba no manda archivo).
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000001')
	WebUI.click(Users.permissionBox('Importar paquetes'))
	WebUI.click(Ui.buttonByText('Aplicar cambios'))
	Packages.verifyMessage('Los permisos se aplicarán en la siguiente solicitud del usuario.')
	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP POST /api/v1/packages/import/preview sin el permiso', Api.statusOf('POST', '/api/v1/packages/import/preview', token, '{}'), 403)

	WebUI.click(Ui.buttonByText('Restablecer predeterminados'))
	Packages.verifyMessage('Se restablecieron los permisos predeterminados del rol.')
	Ui.verifyEquals('estado del permiso en la pantalla', Users.permissionState('Importar paquetes'), 'Importar paquetes: permitido')
	Ui.evidence('TC-HU009-03_predeterminados')

	token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('el permiso restablecido ya no responde 403 al importar',
			Api.statusOf('POST', '/api/v1/packages/import/preview', token, '{}') != 403, true)
}
finally {
	WebUI.closeBrowser()
	Users.resetSalesPermissions()
}
