import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	Ui.searchPackage('address', 'Escazu', 'E2E-PEND-01', 'TC-HU014-04_direccion')
}
finally {
	WebUI.closeBrowser()
}
