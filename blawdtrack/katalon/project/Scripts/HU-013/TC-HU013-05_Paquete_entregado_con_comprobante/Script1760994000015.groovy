import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-05: un paquete entregado muestra el comprobante de entrega: la foto registrada, la firma y la fecha
// real de la entrega tomada del historial (HU-013: "Ver comprobante de entrega").
// Dato: E2E-ENTR-01 del fixture esta ENTREGADO y trae foto y firma en un data URI.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.openDetail('E2E-ENTR-01')
	WebUI.waitForElementPresent(Ui.byTestId('package-proof-card'), 30)

	// El resumen usa la fecha del historial (01/10/2026 12:30) y la firma registrada.
	String resumen = WebUI.getText(Ui.byTestId('package-proof-summary'))
	Ui.verifyContains(resumen, 'Entrega registrada el 01/10/2026 a las')
	Ui.verifyContains(resumen, 'Firma digital registrada')

	// La foto de la entrega se recupera y se muestra dentro de su marco.
	WebUI.waitForElementVisible(Ui.byTestId('delivery-photo-image'), 30)
	Ui.verifyEquals('avisos de comprobante vacio', Ficha.countCss('[data-testid="package-proof-empty"]'), 0)

	// En la propia ficha, la evidencia queda como enlaces a la firma y a la foto.
	String ficha = Ui.textOf('package-detail-card')
	// La etiqueta se pinta en mayusculas (text-transform de MUI), asi se ve en el navegador.
	Ui.verifyContains(ficha, 'EVIDENCIA DE ENTREGA')
	Ui.verifyContains(ficha, 'Firma')
	Ui.verifyContains(ficha, 'Foto')

	Ui.evidence('TC-HU013-05_comprobante')
}
finally {
	WebUI.closeBrowser()
}
