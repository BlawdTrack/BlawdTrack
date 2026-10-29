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

// TC-HU009-05: si se cambia un permiso y se descarta, la pantalla pide confirmar "Salir sin guardar" y no se guarda nada: al
// buscar de nuevo el permiso sigue permitido.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openPermissions('900000001')
	WebUI.click(Users.permissionBox('Eliminar paquetes'))
	Ui.verifyEquals('estado del permiso en la pantalla', Users.permissionState('Eliminar paquetes'), 'Eliminar paquetes: denegado')
	WebUI.click(Ui.buttonByText('Descartar'))
	WebUI.waitForElementVisible(Ui.byTestId('leave-dialog-leave'), 15)
	Ui.evidence('TC-HU009-05_salir_sin_guardar')
	WebUI.click(Ui.byTestId('leave-dialog-leave'))

	Users.openPermissions('900000001')
	Ui.verifyEquals('permiso tras descartar', Users.permissionState('Eliminar paquetes'), 'Eliminar paquetes: permitido')
}
finally {
	WebUI.closeBrowser()
}
