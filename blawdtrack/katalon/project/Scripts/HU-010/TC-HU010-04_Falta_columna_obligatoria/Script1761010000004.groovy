import com.blawd.Imports
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-04: un archivo sin la columna del telefono debe indicar el campo faltante y no permitir registrar.
// Archivo: hu010-tc04-sin-columna-telefono.csv (2 filas, sin la columna Shipping Phone).
//
// Este caso refleja literalmente el criterio de aceptacion. Hoy el backend (RequiredPackageFieldsValidator) solo
// exige numero de envio, numero de orden, cliente y direccion, asi que el archivo se acepta como valido y este caso
// falla hasta que el telefono pase a ser obligatorio (o el criterio cambie).
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu010-tc04-sin-columna-telefono.csv')
	Ui.evidence('TC-HU010-04_sin_telefono')

	// Las 2 filas quedan con error y ninguna se puede registrar.
	Ui.verifyCounts(2, 0, 2, 0)

	// El error dice cual es el campo que falta.
	Ui.verifyContains(Ui.textOf('import-row-invalid'), 'teléfono')
	Imports.verifyConfirmDisabled()
}
finally {
	WebUI.closeBrowser()
}
