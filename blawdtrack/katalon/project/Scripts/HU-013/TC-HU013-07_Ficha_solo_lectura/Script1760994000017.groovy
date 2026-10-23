import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-07: la ficha es de solo lectura: no admite editar ningun campo y no ofrece botones de guardado
// (HU-013: "Consultar en modo solo lectura").
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.openDetail('E2E-PEND-01')

	String ficha = Ui.textOf('package-detail-card')
	Ui.verifyContains(ficha, 'Datos de la entrega')

	// Ningun campo de la tarjeta admite escribir.
	Ui.verifyEquals('campos editables en la ficha',
		Ficha.countCss('[data-testid="package-detail-card"] input, [data-testid="package-detail-card"] textarea, [data-testid="package-detail-card"] select'), 0)
	// Ni botones de guardado o de descarte en toda la pantalla.
	Ui.verifyEquals('boton guardar cambios', Ficha.countCss('[data-testid="edit-save"]'), 0)
	Ui.verifyEquals('boton de formulario', Ficha.countCss('[data-testid="form-submit"]'), 0)
	Ui.verifyEquals('boton descartar', Ficha.countCss('[data-testid="form-discard"]'), 0)

	Ui.evidence('TC-HU013-07_solo_lectura')
}
finally {
	WebUI.closeBrowser()
}
