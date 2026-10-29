import com.blawd.Api
import com.blawd.Env
import com.blawd.Mail
import com.blawd.Packages
import com.blawd.Ui
import com.blawd.Users
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU005-03: buscar un documento que no es de ningún mensajero avisa que no se encontró y no ofrece desactivar.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/couriers/deactivate')
	Users.searchByDocument('799999999')
	Ui.verifyAlert('No se encontró ningún mensajero con ese documento.')
	WebUI.verifyElementNotPresent(Users.resultButton('Desactivar'), 5, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU005-03_no_encontrado')
}
finally {
	WebUI.closeBrowser()
}
