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

// TC-HU005-05: la desactivación queda en la auditoría con la fecha y la cuenta del Super Usuario que la hizo.
Env.prepareData()
Map courier = Users.createCourier('desact')
long auditBefore = Packages.lastAuditId()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/couriers/deactivate')
	Users.searchByDocument(courier.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Desactivar'), 30)
	WebUI.click(Users.resultButton('Desactivar'))
	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-confirm'), 30)
	WebUI.click(Ui.byTestId('confirm-dialog-confirm'))
	Packages.verifyMessage('Mensajero desactivado correctamente.')

	List<String> audit = Users.auditForUserAfter(auditBefore, 'DESACTIVAR_MENSAJERO', courier.email)
	Ui.verifyEquals('hay registro DESACTIVAR_MENSAJERO', audit != null, true)
	if (audit != null) {
		Ui.verifyEquals('responsable', audit[1], GlobalVariable.superEmail)
		Ui.verifyEquals('fecha y hora registradas', audit[0].trim().isEmpty(), false)
	}
}
finally {
	WebUI.closeBrowser()
}
