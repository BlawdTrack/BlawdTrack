import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU011-05: al confirmar la importacion del caso 01 solo se guardan los no duplicados y la base no queda con dos
// envios iguales. Cambia datos (registra E2E-HU011-A01), por eso parte de prepare-data.ps1.
Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()
	Ui.uploadAndReview('hu011-tc01-duplicado-base-datos.csv')
	Ui.verifyCounts(2, 1, 0, 1)

	WebUI.click(Ui.byTestId('import-confirm'))

	// Termina en Consultar paquetes con el aviso de la cantidad registrada.
	WebUI.waitForElementPresent(Ui.byTestId('package-search-input'), 30)
	WebUI.verifyTextPresent('1 paquete registrado', false, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU011-05_aviso')

	// El paquete nuevo se guardo una vez.
	Ui.searchPackage('E2E-HU011-A01')
	WebUI.verifyEqual(Ui.countOf('package-result-row'), 1, FailureHandling.CONTINUE_ON_FAILURE)

	// El duplicado sigue una sola vez y conserva sus datos (no se pisan con los del archivo).
	Ui.searchPackage('E2E-PEND-01')
	WebUI.verifyEqual(Ui.countOf('package-result-row'), 1, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.verifyNotContains(Ui.textOf('package-result-row'), 'Cliente Ya Registrado')

	Ui.evidence('TC-HU011-05_busqueda_del_duplicado')
}
finally {
	WebUI.closeBrowser()
}
