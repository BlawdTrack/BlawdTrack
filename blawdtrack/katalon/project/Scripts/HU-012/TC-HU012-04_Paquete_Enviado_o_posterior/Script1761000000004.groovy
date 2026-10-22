import com.blawd.Api
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-04: un paquete ya despachado (Enviado, En transito o No entregado) no se puede eliminar. En la ficha el
// boton esta en gris con su motivo; al pulsarlo avisa que ya no puede eliminarse y no abre el dialogo. El backend
// tambien lo rechaza (409). No modifica datos.
Map<String, String> dispatched = [
	'E2E-ENV-01'  : 'Enviado',
	'E2E-TRANS-01': 'En tránsito',
	'E2E-NOENT-01': 'No entregado',
]
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	dispatched.each { String number, String status ->
		Packages.openDetail(number)
		WebUI.verifyElementAttributeValue(Ui.byTestId('delete-package-button'), 'aria-disabled', 'true', 10,
				FailureHandling.CONTINUE_ON_FAILURE)
		Ui.verifyContains(WebUI.getText(Ui.byTestId('delete-package-button')), 'No eliminable en “' + status + '”')

		WebUI.click(Ui.byTestId('delete-package-button'))
		Packages.verifyMessage('El paquete ' + number + ' está en “' + status + '”: ya no puede eliminarse.')
		WebUI.verifyElementNotPresent(Ui.byTestId('delete-package-confirm'), 3, FailureHandling.CONTINUE_ON_FAILURE)
		Ui.evidence('TC-HU012-04_' + number)

		Ui.verifyEquals('HTTP DELETE /api/v1/packages/' + number, Api.statusOf('DELETE', '/api/v1/packages/' + number, token), 409)
		Ui.verifyEquals('paquetes ' + number + ' en la base', Packages.countInDatabase(number), 1)
	}
}
finally {
	WebUI.closeBrowser()
}
