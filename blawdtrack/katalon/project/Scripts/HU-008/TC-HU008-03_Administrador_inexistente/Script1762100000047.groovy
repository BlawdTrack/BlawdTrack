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

// TC-HU008-03: buscar un documento que no es de ningún administrador avisa que no se encontró y no ofrece eliminar.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/admins/delete')
	Users.searchByDocument('899999999')
	Ui.verifyAlert('No se encontró ningún administrador con ese documento.')
	WebUI.verifyElementNotPresent(Users.resultButton('Eliminar'), 5, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU008-03_no_existe')
}
finally {
	WebUI.closeBrowser()
}
