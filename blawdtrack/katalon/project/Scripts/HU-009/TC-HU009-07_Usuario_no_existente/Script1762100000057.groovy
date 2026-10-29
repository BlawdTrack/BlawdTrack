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

// TC-HU009-07: buscar un documento que no es de ningún usuario avisa "Usuario no existente" y no muestra matriz.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/gestion-roles')
	Users.searchByDocument('899999998')
	Ui.verifyAlert('Usuario no existente')
	WebUI.verifyElementNotPresent(Users.permissionBox('Importar paquetes'), 5, FailureHandling.CONTINUE_ON_FAILURE)
	Ui.evidence('TC-HU009-07_usuario_no_existe')
}
finally {
	WebUI.closeBrowser()
}
