import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU011-02: el mismo envio dos veces en el archivo (con datos distintos) se detecta y se excluye.
// Archivo: hu011-tc02-duplicado-en-archivo.csv (E2E-HU011-B01 dos veces con otro cliente; E2E-HU011-B02 es normal).
// Se conserva la primera fila y la copia contradictoria queda como duplicado.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu011-tc02-duplicado-en-archivo.csv')

	Ui.verifyEquals('filas con data-testid import-row-duplicate', Ui.countOf('import-row-duplicate'), 1)
	String duplicateRow = Ui.textOf('import-row-duplicate')
	Ui.verifyContains(duplicateRow, 'E2E-HU011-B01')
	Ui.verifyContains(duplicateRow, 'Repetido en el archivo')

	// 3 filas leidas: 2 validas (la primera copia y B02) y 1 duplicado excluido.
	Ui.verifyCounts(3, 2, 0, 1)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'repetido en el archivo')

	Ui.evidence('TC-HU011-02_previsualizacion')
}
finally {
	WebUI.closeBrowser()
}
