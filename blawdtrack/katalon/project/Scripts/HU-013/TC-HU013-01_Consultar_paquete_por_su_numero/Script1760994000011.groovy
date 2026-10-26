import com.blawd.Env
import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-01: buscar un paquete por su numero de envio y abrir su fila muestra la ficha con los datos del cliente
// y de la entrega (HU-013: "Abrir un paquete por su numero de envio").
// Dato: E2E-PEND-01 del fixture, sin mensajero y con un articulo registrado.
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.searchAndOpen('E2E-PEND-01')

	Ficha.verifyMatches('direccion de la ficha', WebUI.getUrl(), '.*/main-menu/paquetes/buscar/E2E-PEND-01$')

	String ficha = Ui.textOf('package-detail-card')
	Ui.verifyContains(ficha, 'E2E-PEND-01')            // numero de envio, en la cabecera
	Ui.verifyContains(ficha, 'Orden SO-E2E-001')
	Ui.verifyContains(ficha, 'Pendiente')               // estado del paquete
	Ui.verifyContains(ficha, 'Datos de la entrega')
	Ui.verifyContains(ficha, 'Cliente Pendiente')       // cliente
	Ui.verifyContains(ficha, '70000001')                // telefono
	Ui.verifyContains(ficha, 'San Jose, Escazu')        // direccion de entrega
	Ui.verifyContains(ficha, 'Alfajor de cafe')         // articulos

	Ui.evidence('TC-HU013-01_ficha')
}
finally {
	WebUI.closeBrowser()
}
