import com.blawd.Env
import com.blawd.Imports
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-08: los datos de un paquete importado, buscado en la lista, coinciden con el archivo: orden, envio,
// cliente, direccion, telefono y horario. Archivo: importacion-valida.csv; el horario de la lista es el texto de la
// columna Notes (E2E-IMP-001 no trae nota y queda con el horario por defecto).
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('importacion-valida.csv')
	Ui.verifyCounts(4, 4, 0, 0)
	Imports.confirm()
	Packages.verifyMessage('4 paquetes registrados')

	Imports.verifyListed('E2E-IMP-001', 'SO-IMP-001', 'Cliente Uno', 'San Jose, Escazu', '88001001', '9:00 a.m. a 4:00 p.m.')
	Ui.evidence('TC-HU010-08_E2E-IMP-001')
	Imports.verifyListed('E2E-IMP-002', 'SO-IMP-002', 'Cliente Dos', 'Heredia, Barva', '88001002', 'Antes de las 3 p.m.')
	Ui.evidence('TC-HU010-08_E2E-IMP-002')
	Imports.verifyListed('E2E-IMP-003', 'SO-IMP-003', 'Cliente Tres', 'Alajuela, Atenas', '88001003', 'Después de las dos de la tarde')
	Imports.verifyListed('E2E-IMP-004', 'SO-IMP-004', 'Cliente Cuatro', 'Cartago, Paraiso', '88001004', 'De 10 a 2')
}
finally {
	WebUI.closeBrowser()
}
