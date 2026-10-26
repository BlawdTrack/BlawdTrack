import com.blawd.Api
import com.blawd.Env
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-01: un paquete Pendiente se elimina desde la lista, tras confirmar en el dialogo. Aparece el mensaje de
// exito y el paquete ya no esta en la lista. Paquete: E2E-DEL-P1 (Pendiente).
String number = 'E2E-DEL-P1'
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Packages.search(number)
	Packages.waitForRow(number)
	WebUI.click(Packages.rowDeleteButton(number))

	// El dialogo pide confirmar y muestra el paquete.
	Packages.waitForDialog()
	Ui.verifyContains(Packages.dialogText(), 'Eliminar paquete')
	Ui.verifyContains(Packages.dialogText(), number)
	Ui.evidence('TC-HU012-01_dialogo')
	WebUI.click(Ui.byTestId('delete-package-confirm'))
	Packages.waitForDialogClosed()

	// Mensaje de exito y el paquete sale de la lista.
	Packages.verifyMessage('Paquete ' + number + ' eliminado correctamente.')
	WebUI.waitForElementNotPresent(Packages.rowDeleteButton(number), 10)
	Ui.evidence('TC-HU012-01_eliminado')

	// Ya no existe en el sistema.
	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP GET /api/v1/packages/' + number, Api.statusOf('GET', '/api/v1/packages/' + number, token), 404)
}
finally {
	WebUI.closeBrowser()
}
