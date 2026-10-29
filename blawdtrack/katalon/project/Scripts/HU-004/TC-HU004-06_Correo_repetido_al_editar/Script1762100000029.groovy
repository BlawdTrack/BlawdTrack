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

// TC-HU004-06: al editar, el correo no puede ser el de otro usuario: la pantalla avisa "El correo ya está registrado" y no
// guarda. Se usan dos mensajeros nuevos.
Env.prepareData()
Map first = Users.createCourier('edit')
Map second = Users.createCourier('edit')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(second.documentNumber)
	Ui.type('email', first.email)
	WebUI.click(Ui.byTestId('edit-save'))
	Ui.verifyAlert('El correo ya está registrado')
	Ui.evidence('TC-HU004-06_correo_repetido')

	Users.openCourierForEdit(second.documentNumber)
	Ui.verifyEquals('correo guardado', Ui.valueOf('email'), second.email)
}
finally {
	WebUI.closeBrowser()
}
