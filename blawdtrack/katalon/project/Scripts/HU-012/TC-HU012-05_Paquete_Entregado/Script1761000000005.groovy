import com.blawd.Api
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-05: un paquete Entregado no se puede eliminar, ni desde la lista ni desde la ficha, y el backend lo
// rechaza (409). Paquete: E2E-ENTR-01 (Entregado). No modifica datos.
String number = 'E2E-ENTR-01'
String blocked = 'El paquete ' + number + ' está en “Entregado”: ya no puede eliminarse.'
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	// Desde la lista: el boton de la fila esta en gris y solo avisa.
	Packages.search(number)
	Packages.waitForRow(number)
	WebUI.verifyElementAttributeValue(Packages.rowDeleteButton(number), 'aria-disabled', 'true', 10, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.click(Packages.rowDeleteButton(number))
	Packages.verifyMessage(blocked)
	WebUI.verifyElementNotPresent(Ui.byTestId('delete-package-confirm'), 3, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU012-05_lista')

	// Desde la ficha: lo mismo, con el motivo en el boton.
	Packages.openDetail(number)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('delete-package-button')), 'No eliminable en “Entregado”')
	WebUI.click(Ui.byTestId('delete-package-button'))
	Packages.verifyMessage(blocked)
	WebUI.verifyElementNotPresent(Ui.byTestId('delete-package-confirm'), 3, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU012-05_ficha')

	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP DELETE /api/v1/packages/' + number, Api.statusOf('DELETE', '/api/v1/packages/' + number, token), 409)
	Ui.verifyEquals('paquetes ' + number + ' en la base', Packages.countInDatabase(number), 1)
}
finally {
	WebUI.closeBrowser()
}
