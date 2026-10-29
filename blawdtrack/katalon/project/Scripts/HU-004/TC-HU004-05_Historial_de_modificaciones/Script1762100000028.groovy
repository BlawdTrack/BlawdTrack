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

// TC-HU004-05: cada edición queda en el historial del mensajero con su fecha y los campos que cambiaron.
Env.prepareData()
Map courier = Users.createCourier('edit')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(courier.documentNumber)
	Ui.type('phone', '69' + Users.suffix())
	WebUI.click(Ui.byTestId('edit-save'))
	Packages.verifyMessage('Notificación de actualización exitosa. Los datos del mensajero han sido modificados.')

	Users.openCourierForEdit(courier.documentNumber)
	WebUI.click(Ui.css('#tab-historial'))
	Packages.verifyPageText('Historial de modificaciones')
	Packages.verifyPageText('Campos modificados: Teléfono')
	Packages.verifyPageText('Mensajero registrado')
	Ui.evidence('TC-HU004-05_historial')
}
finally {
	WebUI.closeBrowser()
}
