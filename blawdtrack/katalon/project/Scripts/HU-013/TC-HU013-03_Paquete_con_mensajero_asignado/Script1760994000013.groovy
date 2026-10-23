import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-03: un paquete con mensajero asignado muestra el nombre del mensajero y su informacion de contacto
// (telefono y horario) dentro de la ficha (HU-013: "Ver el mensajero asignado").
// Dato: E2E-ASIG-01 del fixture esta asignado al mensajero de prueba.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.openDetail('E2E-ASIG-01')

	String mensajero = WebUI.getText(Ui.byTestId('package-courier-name')).trim()
	Ui.verifyEquals('nombre del mensajero', mensajero, 'Mensajero E2E')

	String ficha = Ui.textOf('package-detail-card')
	// Las etiquetas del InfoBlock se pintan en mayusculas (text-transform de MUI), asi se ve en el navegador.
	Ui.verifyContains(ficha, 'MENSAJERO ASIGNADO')
	Ui.verifyContains(ficha, '88880002')       // telefono del mensajero
	Ui.verifyContains(ficha, '08:00 a 17:00')  // horario del mensajero
	Ui.verifyContains(ficha, 'Heredia, Barva') // direccion de entrega

	Ui.evidence('TC-HU013-03_mensajero_asignado')
}
finally {
	WebUI.closeBrowser()
}
