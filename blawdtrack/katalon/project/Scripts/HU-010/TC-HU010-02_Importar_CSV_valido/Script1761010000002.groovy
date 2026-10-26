import com.blawd.Env
import com.blawd.Imports
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-02: igual que el TC-HU010-01 pero con un CSV. Archivo: importacion-valida.csv (E2E-IMP-001..004).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-valida.csv')

	Ui.verifyCounts(4, 4, 0, 0)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'Todos los registros')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación de 4 paquetes válidos')
	Ui.evidence('TC-HU010-02_previsualizacion')

	Imports.confirm()
	Packages.verifyMessage('4 paquetes registrados')
	Ui.evidence('TC-HU010-02_importado')

	for (int i = 1; i <= 4; i++) {
		String shipment = 'E2E-IMP-00' + i
		Packages.search(shipment)
		Ui.waitForSearchResult(shipment, shipment)
		Ui.verifyContains(Ui.textOf('package-result-row'), 'Pendiente')
	}
}
finally {
	WebUI.closeBrowser()
}
