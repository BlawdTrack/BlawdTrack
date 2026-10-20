import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU011-01: un envio que ya existe en la base de datos se resalta en la previsualizacion y se excluye.
// Archivo: hu011-tc01-duplicado-base-datos.csv (E2E-PEND-01 ya esta registrado; E2E-HU011-A01 es nuevo).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu011-tc01-duplicado-base-datos.csv')

	// Se resalta: una sola fila de duplicado, con el numero y la causa.
	WebUI.verifyEqual(Ui.countOf('import-row-duplicate'), 1, FailureHandling.CONTINUE_ON_FAILURE)
	String duplicateRow = Ui.textOf('import-row-duplicate')
	Ui.verifyContains(duplicateRow, 'Duplicado')
	Ui.verifyContains(duplicateRow, 'E2E-PEND-01')
	Ui.verifyContains(duplicateRow, 'Ya registrado en la base de datos')

	// Se excluye: no cuenta entre los validos y la importacion solo incluye el paquete nuevo.
	Ui.verifyCounts(2, 1, 0, 1)
	Ui.verifyNotContains(Ui.textOf('import-row-valid'), 'E2E-PEND-01')
	Ui.verifyContains(Ui.textOf('import-row-valid'), 'E2E-HU011-A01')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'Se excluyen de la importación')

	Ui.evidence('TC-HU011-01_previsualizacion')
}
finally {
	WebUI.closeBrowser()
}
