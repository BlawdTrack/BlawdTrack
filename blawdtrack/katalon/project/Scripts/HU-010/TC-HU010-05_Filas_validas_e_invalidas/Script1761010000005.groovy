import com.blawd.Env
import com.blawd.Imports
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-05: un archivo con filas validas e invalidas muestra ambas cantidades y los errores antes de confirmar, y
// solo se importan las validas. Archivo: importacion-con-errores.csv: 5 leidos, 2 validos (E2E-ERR-001 y E2E-ERR-005,
// que no trae telefono pero el telefono no es obligatorio) y 3 con error (E2E-ERR-002 sin orden, -003 sin cliente y
// -004 sin direccion).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-con-errores.csv')

	Ui.verifyCounts(5, 2, 3, 0)
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-summary')), '3 registros con errores')

	// Los errores se ven antes de confirmar, con el campo que falta en cada fila.
	String errors = Ui.textOf('import-row-invalid')
	Ui.verifyContains(errors, 'El campo número de orden es obligatorio')
	Ui.verifyContains(errors, 'El campo nombre del cliente es obligatorio')
	Ui.verifyContains(errors, 'El campo dirección de entrega es obligatorio')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('import-confirm')), 'Confirmar importación de 2 paquetes válidos')
	Ui.evidence('TC-HU010-05_previsualizacion')

	Imports.confirm()
	Packages.verifyMessage('2 paquetes registrados')

	// Solo las validas quedaron registradas.
	for (String shipment : ['E2E-ERR-001', 'E2E-ERR-005']) {
		Packages.search(shipment)
		Ui.waitForSearchResult(shipment, shipment)
	}
	for (String shipment : ['E2E-ERR-002', 'E2E-ERR-003', 'E2E-ERR-004']) {
		Imports.verifyNotListed(shipment)
	}
	Ui.evidence('TC-HU010-05_solo_validas')
}
finally {
	WebUI.closeBrowser()
}
