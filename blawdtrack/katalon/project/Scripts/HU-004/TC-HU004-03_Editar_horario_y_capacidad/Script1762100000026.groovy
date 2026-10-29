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

// TC-HU004-03: se cambian el horario (9:00 am a 12:00 pm) y la capacidad máxima (22 kg) con los selectores de rueda y,
// al guardar y volver a abrir, los dos quedaron guardados.
Env.prepareData()
Map courier = Users.createCourier('edit')
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openCourierForEdit(courier.documentNumber)
	Ui.pickTime('#scheduleStart', 'Hora de entrada', '09', '00', 'am')
	Ui.pickTime('#scheduleEnd', 'Hora de salida', '12', '00', 'pm')
	Ui.pickWeight("input[aria-label='Capacidad máxima de carga']", 'Capacidad máxima de carga', '22')
	WebUI.click(Ui.byTestId('edit-save'))
	Packages.verifyMessage('Notificación de actualización exitosa. Los datos del mensajero han sido modificados.')

	Users.openCourierForEdit(courier.documentNumber)
	Ui.verifyEquals('hora de entrada', Ui.valueOf('scheduleStart'), '9:00 am')
	Ui.verifyEquals('hora de salida', Ui.valueOf('scheduleEnd'), '12:00 pm')
	Ui.verifyEquals('capacidad de carga', Ui.valueOf('maxLoadCapacityKg'), '22 kg')
	Ui.evidence('TC-HU004-03_horario_y_capacidad')
}
finally {
	WebUI.closeBrowser()
}
