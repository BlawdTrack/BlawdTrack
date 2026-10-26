import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-02: la ficha muestra la linea de tiempo completa del paquete: los cambios de estado en orden, cada uno
// con su fecha, su hora y el responsable (HU-013: "Ver linea de tiempo de estados").
// Dato: E2E-ENTR-01 del fixture tiene los cinco eventos (alta, asignacion, envio, transito y entrega).
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ficha.openDetail('E2E-ENTR-01')

	def entradas = WebUI.findWebElements(Ui.byTestId('package-history-entry'), 10)
	String[] etiquetas = ['Registrado como Pendiente', 'Asignado', 'Enviado', 'En tránsito', 'Entregado']
	String[] responsables = ['Ventas E2E', 'Ventas E2E', 'Ventas E2E', 'Mensajero E2E', 'Mensajero E2E']
	Ui.verifyEquals('entradas del historial', entradas.size(), etiquetas.size())

	entradas.eachWithIndex { entrada, i ->
		String texto = entrada.getText().replaceAll('\\s+', ' ')
		Ui.verifyContains(texto, etiquetas[i])
		// Segunda linea del evento: fecha dd/mm/aaaa · hora · responsable del cambio.
		Ficha.verifyMatches('entrada ' + (i + 1) + ' (fecha, hora y responsable)', texto,
			'\\d{2}/\\d{2}/\\d{4} · \\d{2}:\\d{2} · ' + responsables[i])
	}

	// El evento final es la entrega, confirmada por el mensajero a las 12:30.
	Ficha.verifyMatches('hora de la entrega', entradas.last().getText().replaceAll('\\s+', ' '), '01/10/2026 · 12:30')

	Ui.evidence('TC-HU013-02_historial')
}
finally {
	WebUI.closeBrowser()
}
