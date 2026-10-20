import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU011-04: un archivo mixto muestra la cantidad de validos y de duplicados antes de confirmar.
// Archivo: importacion-con-duplicados.csv (E2E-PEND-01 ya registrado, E2E-DUP-001 repetido con datos distintos y
// E2E-DUP-002 en dos filas con los mismos datos, que se agrupan): 4 leidos, 2 validos y 2 duplicados.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-con-duplicados.csv')

	Ui.verifyCounts(4, 2, 0, 2)

	// La barra de confirmacion repite los totales antes de importar.
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación de 2 paquetes válidos')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), '2 duplicados')

	// Cada grupo muestra sus filas: 2 validas y 2 duplicadas.
	Ui.verifyContains(Ui.textOf('import-row-duplicate'), 'Ya registrado en la base de datos')
	Ui.verifyContains(Ui.textOf('import-row-duplicate'), 'Repetido en el archivo')

	Ui.evidence('TC-HU011-04_conteos')
}
finally {
	WebUI.closeBrowser()
}
