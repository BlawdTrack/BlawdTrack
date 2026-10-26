import com.blawd.Imports
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-06: si todas las filas son invalidas no se puede confirmar y se pide corregir el archivo.
// Archivo: hu010-tc06-todo-invalido.csv (4 filas, todas sin algun campo obligatorio).
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu010-tc06-todo-invalido.csv')

	Ui.verifyCounts(4, 0, 4, 0)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'Ningún registro')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), 'corrige el archivo')

	// Confirmar queda bloqueado y sin cantidad; solo se puede cambiar el archivo.
	Imports.verifyConfirmDisabled()
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación')
	Ui.verifyNotContains(WebUI.getText(Ui.byTestId('import-confirm')), 'paquetes válidos')
	Ui.evidence('TC-HU010-06_todo_invalido')
}
finally {
	WebUI.closeBrowser()
}
