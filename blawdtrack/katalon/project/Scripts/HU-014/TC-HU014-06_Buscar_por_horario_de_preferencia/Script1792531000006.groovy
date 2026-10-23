import com.blawd.Env
import com.blawd.Ui
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

Env.prepareData()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openPackageSearchPage()
	Ui.searchPackage('schedule', 'Antes de las 3 p.m.', 'E2E-ASIG-01', 'TC-HU014-06_horario')
}
finally {
	WebUI.closeBrowser()
}
