import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	WebUI.setText(Ui.byTestId('package-search-input'), 'HU014-SIN-COINCIDENCIAS')
	WebUI.click(Ui.byTestId('package-search-submit'))
	WebUI.waitForElementVisible(Ui.byTestId('package-search-empty-clear'), 20)

	Ui.verifyContains(WebUI.getText(Ui.byTestId('package-search-empty-title')), 'Sin resultados')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('package-search-summary')), 'HU014-SIN-COINCIDENCIAS')
	WebUI.verifyElementNotPresent(Ui.byTestId('package-result-row'), 5)
	Ui.evidence('TC-HU014-07_sin_coincidencias')
}
finally {
	WebUI.closeBrowser()
}
