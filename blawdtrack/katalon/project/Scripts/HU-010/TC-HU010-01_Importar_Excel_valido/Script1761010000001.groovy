import com.blawd.Env
import com.blawd.Imports
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-01: un Excel (.xlsx) valido se revisa, se confirma y los paquetes quedan registrados como Pendiente.
// Archivo: hu010-tc01-valido.xlsx (4 paquetes E2E-HU010-XLS-001..004).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu010-tc01-valido.xlsx')

	// Previsualizacion: 4 leidos, 4 validos, sin errores ni duplicados.
	Ui.verifyCounts(4, 4, 0, 0)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'Todos los registros')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación de 4 paquetes válidos')
	Ui.evidence('TC-HU010-01_previsualizacion')

	// Confirmar: la pantalla pasa a "Consultar paquetes" con el aviso de cuantos se registraron.
	Imports.confirm()
	Packages.verifyMessage('4 paquetes registrados')
	Ui.evidence('TC-HU010-01_importado')

	// Cada paquete queda en la lista con estado "Pendiente".
	for (int i = 1; i <= 4; i++) {
		String shipment = 'E2E-HU010-XLS-00' + i
		Packages.search(shipment)
		Ui.waitForSearchResult(shipment, shipment)
		Ui.verifyContains(Ui.textOf('package-result-row'), 'Pendiente')
	}
}
finally {
	WebUI.closeBrowser()
}
