import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU011-03: un archivo limpio informa que todos los registros son validos y el flujo sigue normal.
// Archivo: importacion-valida.csv (E2E-IMP-001..004; el 001 viene en dos filas con los mismos datos y se agrupa).
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-valida.csv')

	Ui.verifyCounts(4, 4, 0, 0)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'son válidos y se pueden importar')
	Ui.verifyEquals('filas con data-testid import-row-duplicate', Ui.countOf('import-row-duplicate'), 0)

	// Sigue normal: se puede confirmar la importacion (no se confirma para no registrar los paquetes).
	WebUI.verifyElementClickable(Ui.byTestId('import-confirm'), FailureHandling.CONTINUE_ON_FAILURE)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación de 4 paquetes válidos')

	Ui.evidence('TC-HU011-03_previsualizacion')
}
finally {
	WebUI.closeBrowser()
}
