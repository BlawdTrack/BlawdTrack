import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-04: un paquete todavia no asignado dice "Sin mensajero asignado" en la ficha, sin nombres inventados
// (HU-013: "Ver el mensajero asignado", caso todavia no hay).
// Dato: E2E-PEND-01 del fixture no tiene mensajero.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.openDetail('E2E-PEND-01')

	String mensajero = WebUI.getText(Ui.byTestId('package-courier-name')).trim()
	Ui.verifyEquals('etiqueta del mensajero', mensajero, 'Sin mensajero asignado')

	// Tampoco aparece el nombre del mensajero de prueba en la ficha.
	Ui.verifyNotContains(Ui.textOf('package-detail-card'), 'Mensajero E2E')

	Ui.evidence('TC-HU013-04_sin_mensajero')
}
finally {
	WebUI.closeBrowser()
}
