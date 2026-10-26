import com.blawd.Api
import com.blawd.Ficha
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU013-06: un numero de envio que no existe muestra un aviso claro con el numero consultado, sin ficha y sin
// boton de reintento (HU-013: "Ver aviso cuando no existe el numero de envio"). El backend responde 404.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	String numero = 'E2E-NOEXISTE-99'
	WebUI.navigateToUrl(GlobalVariable.baseUrl + '/main-menu/paquetes/buscar/' + numero)

	// El aviso aparece cuando la consulta responde 404. El texto se lee con JavaScript (document.body.innerText),
	// igual que countCss, para no depender de keywords de texto que no existen en esta version de Katalon.
	String texto = ''
	long limite = System.currentTimeMillis() + 30000L
	while (System.currentTimeMillis() < limite) {
		texto = String.valueOf(WebUI.executeJavaScript('return document.body ? document.body.innerText : ""', null))
		if (texto.contains('No se encontró un paquete')) {
			break
		}
		WebUI.delay(1)
	}

	Ui.verifyContains(texto, 'No se encontró un paquete con el número de envío "' + numero + '"')
	Ui.verifyNotContains(texto, 'Reintentar')
	Ui.verifyEquals('la ficha no se abre', Ficha.countCss('[data-testid="package-detail-card"]'), 0)

	// Capa de API: el numero inexistente responde 404.
	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP GET /api/v1/packages/' + numero, Api.statusOf('GET', '/api/v1/packages/' + numero, token), 404)

	Ui.evidence('TC-HU013-06_no_encontrado')
}
finally {
	WebUI.closeBrowser()
}
