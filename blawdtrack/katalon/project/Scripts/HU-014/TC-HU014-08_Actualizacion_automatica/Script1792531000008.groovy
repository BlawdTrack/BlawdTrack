import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	WebUI.setText(Ui.byTestId('package-search-input'), 'HU014-SIN-COINCIDENCIAS')
	WebUI.click(Ui.byTestId('package-search-submit'))
	WebUI.waitForElementVisible(Ui.byTestId('package-search-empty-clear'), 20)

	// Se modifica el texto sin presionar Buscar, como pide el criterio de aceptación.
	def searchInput = Ui.byTestId('package-search-input')
	WebUI.clearText(searchInput)
	WebUI.setText(searchInput, 'E2E-PEND-01')
	WebUI.verifyElementPresent(
		Ui.css("[data-testid='package-result-row'] a[href\$='/E2E-PEND-01']"),
		10,
		FailureHandling.CONTINUE_ON_FAILURE
	)
	Ui.evidence('TC-HU014-08_actualizacion_automatica')
}
finally {
	WebUI.closeBrowser()
}
