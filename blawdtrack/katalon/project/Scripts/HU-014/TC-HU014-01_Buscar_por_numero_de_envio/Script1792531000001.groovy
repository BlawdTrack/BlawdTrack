import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	Ui.searchPackage('shipmentNumber', 'E2E-PEND-01', 'E2E-PEND-01', 'TC-HU014-01_numero_envio')

	String row = Ui.textOf('package-result-row')
	Ui.verifyContains(row, 'SO-E2E-001')
	Ui.verifyContains(row, 'Cliente Pendiente')
	Ui.verifyContains(row, 'San Jose, Escazu')
	Ui.verifyContains(row, '70000001')
	Ui.verifyContains(row, 'Pendiente')
}
finally {
	WebUI.closeBrowser()
}
