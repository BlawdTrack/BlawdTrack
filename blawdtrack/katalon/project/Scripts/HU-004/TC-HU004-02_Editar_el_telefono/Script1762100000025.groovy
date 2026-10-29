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

// TC-HU004-02: se cambia el teléfono, la pantalla confirma la actualización y, al volver a abrir al mensajero, el
// teléfono nuevo quedó guardado.
Env.prepareData()
Map courier = Users.createCourier('edit')
String newPhone = '69' + Users.suffix()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(courier.documentNumber)
	Ui.type('phone', newPhone)
	WebUI.click(Ui.byTestId('edit-save'))
	Packages.verifyMessage('Notificación de actualización exitosa. Los datos del mensajero han sido modificados.')
	Ui.evidence('TC-HU004-02_actualizado')

	Users.openCourierForEdit(courier.documentNumber)
	Ui.verifyEquals('teléfono guardado', Ui.valueOf('phone'), newPhone)
}
finally {
	WebUI.closeBrowser()
}
