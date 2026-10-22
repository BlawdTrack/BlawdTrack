import com.blawd.Api
import com.blawd.Env
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-02: un paquete Asignado a un mensajero se elimina desde su ficha. Aparece el mensaje de exito y la ficha
// confirma que ya no esta en el sistema ni en la lista del mensajero. Paquete: E2E-DEL-A1 (Asignado al Mensajero E2E).
// La lista del mensajero en la aplicacion llega con HU-022; aqui se comprueba que el paquete ya no existe (API y base),
// que es lo que esa lista consultara.
String number = 'E2E-DEL-A1'
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Packages.openDetail(number)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('package-courier-name')), 'Mensajero E2E')

	WebUI.click(Ui.byTestId('delete-package-button'))
	Packages.waitForDialog()
	WebUI.click(Ui.byTestId('delete-package-confirm'))
	Packages.waitForDialogClosed()

	Packages.verifyMessage('Paquete ' + number + ' eliminado correctamente.')
	Packages.verifyPageText('El paquete ' + number + ' ya no está en el sistema ni en la lista del mensajero.')
	Ui.evidence('TC-HU012-02_eliminado')

	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP GET /api/v1/packages/' + number, Api.statusOf('GET', '/api/v1/packages/' + number, token), 404)
	Ui.verifyEquals('paquetes ' + number + ' en la base (con su asignacion)', Packages.countInDatabase(number), 0)
}
finally {
	WebUI.closeBrowser()
}
