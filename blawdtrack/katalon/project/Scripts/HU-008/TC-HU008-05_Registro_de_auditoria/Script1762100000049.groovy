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

// TC-HU008-05: la eliminación queda en la auditoría con la fecha, la cuenta del Super Usuario que la hizo y los datos del
// administrador eliminado.
Env.prepareData()
Map admin = Users.createAdmin('audit')
long auditBefore = Packages.lastAuditId()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.openSearchPage('/main-menu/admins/delete')
	Users.searchByDocument(admin.documentNumber)
	WebUI.waitForElementVisible(Users.resultButton('Eliminar'), 30)
	WebUI.click(Users.resultButton('Eliminar'))
	WebUI.waitForElementVisible(Ui.byTestId('confirm-dialog-confirm'), 30)
	WebUI.click(Ui.byTestId('confirm-dialog-confirm'))
	Packages.verifyMessage('Administrador eliminado correctamente.')

	List<String> audit = Users.auditAfter(auditBefore, 'ELIMINAR_ADMINISTRADOR', admin.email)
	Ui.verifyEquals('hay registro ELIMINAR_ADMINISTRADOR', audit != null, true)
	if (audit != null) {
		Ui.verifyEquals('responsable', audit[1], GlobalVariable.superEmail)
		Ui.verifyContains(audit[2], admin.documentNumber)
		Ui.verifyEquals('fecha y hora registradas', audit[0].trim().isEmpty(), false)
	}
}
finally {
	WebUI.closeBrowser()
}
