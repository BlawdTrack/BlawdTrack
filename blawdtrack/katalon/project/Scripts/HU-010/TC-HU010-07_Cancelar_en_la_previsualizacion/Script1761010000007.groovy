import com.blawd.Env
import com.blawd.Imports
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-07: al salir de la previsualizacion sin confirmar no se importa ningun paquete. Se prueban las dos salidas:
// "Cambiar archivo" (vuelve al paso 1) y "Cancelar" (vuelve al menu). Archivo: importacion-valida.csv.
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-valida.csv')
	Ui.verifyCounts(4, 4, 0, 0)

	// "Cambiar archivo": descarta la revision y deja la zona de carga vacia.
	WebUI.click(Ui.byTestId('import-load-another'))
	WebUI.waitForElementPresent(Ui.byTestId('import-select-file'), 30)
	WebUI.verifyElementNotPresent(Ui.byTestId('import-count-read'), 5, FailureHandling.CONTINUE_ON_FAILURE)
	WebUI.verifyElementHasAttribute(Ui.byTestId('import-review'), 'disabled', 5, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU010-07_cambiar_archivo')

	// "Cancelar" del paso 1: sale de la importacion.
	WebUI.click(Ui.byTestId('import-cancel'))
	WebUI.waitForElementNotPresent(Ui.byTestId('import-select-file'), 30)

	// Ningun paquete del archivo quedo registrado.
	for (int i = 1; i <= 4; i++) {
		Imports.verifyNotListed('E2E-IMP-00' + i)
	}
	Ui.evidence('TC-HU010-07_nada_importado')
}
finally {
	WebUI.closeBrowser()
}
