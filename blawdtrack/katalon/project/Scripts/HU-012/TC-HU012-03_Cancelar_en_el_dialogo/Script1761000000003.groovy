import com.blawd.Api
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import org.openqa.selenium.Keys

import internal.GlobalVariable

// TC-HU012-03: cancelar en el dialogo no elimina. Se cancela con el boton y con la tecla Esc; el dialogo se cierra y
// el paquete sigue en la lista. Paquete: E2E-DEL-P2 (Pendiente). No modifica datos.
String number = 'E2E-DEL-P2'
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Packages.search(number)
	Packages.waitForRow(number)

	// Cancelar con el boton.
	WebUI.click(Packages.rowDeleteButton(number))
	Packages.waitForDialog()
	Ui.evidence('TC-HU012-03_dialogo')
	WebUI.click(Ui.byTestId('delete-package-cancel'))
	Packages.waitForDialogClosed()

	// Cancelar con Esc (el foco empieza en "Cancelar").
	WebUI.click(Packages.rowDeleteButton(number))
	Packages.waitForDialog()
	WebUI.sendKeys(Ui.byTestId('delete-package-cancel'), Keys.chord(Keys.ESCAPE))
	Packages.waitForDialogClosed()

	// El paquete sigue en la lista y en el sistema.
	WebUI.verifyElementPresent(Packages.rowDeleteButton(number), 5)
	Ui.evidence('TC-HU012-03_sigue_en_la_lista')
	String token = Api.tokenFor(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
	Ui.verifyEquals('HTTP GET /api/v1/packages/' + number, Api.statusOf('GET', '/api/v1/packages/' + number, token), 200)
}
finally {
	WebUI.closeBrowser()
}
