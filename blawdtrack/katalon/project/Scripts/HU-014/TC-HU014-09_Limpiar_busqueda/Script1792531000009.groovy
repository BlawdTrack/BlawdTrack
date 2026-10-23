import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	WebUI.setText(Ui.byTestId('package-search-input'), 'E2E-PEND-01')
	WebUI.click(Ui.byTestId('package-search-submit'))
	WebUI.waitForElementVisible(Ui.byTestId('package-search-clear'), 20)

	WebUI.click(Ui.byTestId('package-search-clear'))
	Ui.verifyEquals('campo limpio', WebUI.getAttribute(Ui.byTestId('package-search-input'), 'value'), '')
	Ui.verifyContains(WebUI.getText(Ui.byTestId('package-search-summary')), 'paquetes en la lista de distribución')
	WebUI.waitForElementVisible(Ui.css("[data-testid='package-result-row'] a[href\$='/E2E-PEND-01']"), 20)
	Ui.evidence('TC-HU014-09_lista_completa')
}
finally {
	WebUI.closeBrowser()
}
