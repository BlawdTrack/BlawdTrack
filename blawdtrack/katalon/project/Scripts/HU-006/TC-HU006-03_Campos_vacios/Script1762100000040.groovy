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

// TC-HU006-03: enviar el formulario vacío no crea nada y marca los cuatro campos obligatorios.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openAdminForm()
	WebUI.click(Ui.byTestId('form-submit'))

	Ui.verifyFieldError('Ingresa el nombre completo.')
	Ui.verifyFieldError('Ingresa el correo electrónico.')
	Ui.verifyFieldError('Ingresa el número de teléfono.')
	Ui.verifyFieldError('Ingresa el número de documento.')
	Ui.verifyUrl('.*/main-menu/admins/new$')
	Ui.evidence('TC-HU006-03_campos_vacios')
}
finally {
	WebUI.closeBrowser()
}
