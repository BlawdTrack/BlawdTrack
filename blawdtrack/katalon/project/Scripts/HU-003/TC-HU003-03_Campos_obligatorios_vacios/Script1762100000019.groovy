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

// TC-HU003-03: enviar el formulario vacío no registra nada y marca los campos obligatorios.
Env.prepareData()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForm()
	WebUI.click(Ui.byTestId('form-submit'))

	Ui.verifyFieldError('Ingresa el nombre completo.')
	Ui.verifyFieldError('Ingresa el correo electrónico.')
	Ui.verifyFieldError('Ingresa el número de documento.')
	Ui.verifyUrl('.*/main-menu/couriers/new$')
	Ui.evidence('TC-HU003-03_campos_vacios')
}
finally {
	WebUI.closeBrowser()
}
