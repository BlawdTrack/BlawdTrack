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

// TC-HU006-06: toda creación queda en la auditoría con la fecha, la cuenta del Super Usuario que la hizo y el documento
// del administrador creado.
Env.prepareData()
Map admin = Users.adminData('audit')
long auditBefore = Packages.lastAuditId()
Ui.login(GlobalVariable.superEmail, GlobalVariable.superPassword)
try {
	Users.registerAdminThroughUi(admin)

	List<String> audit = Users.auditAfter(auditBefore, 'CREAR_ADMINISTRADOR', admin.email)
	Ui.verifyEquals('hay registro CREAR_ADMINISTRADOR', audit != null, true)
	if (audit != null) {
		Ui.verifyEquals('responsable', audit[1], GlobalVariable.superEmail)
		Ui.verifyContains(audit[2], admin.documentNumber)
		Ui.verifyEquals('fecha y hora registradas', audit[0].trim().isEmpty(), false)
	}
}
finally {
	WebUI.closeBrowser()
}
