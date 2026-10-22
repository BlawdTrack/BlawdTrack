import com.blawd.Env
import com.blawd.Packages
import com.blawd.Ui
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU012-06: cada eliminacion queda en la auditoria con fecha, hora y la cuenta del administrador. La pantalla de
// auditoria de paquetes llega con HU-028, asi que el registro se comprueba en la tabla auditorias. Paquete: E2E-DEL-P3.
String number = 'E2E-DEL-P3'
Env.prepareData()
long lastAuditBefore = Packages.lastAuditId()
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Packages.search(number)
	Packages.waitForRow(number)
	WebUI.click(Packages.rowDeleteButton(number))
	Packages.waitForDialog()
	WebUI.click(Ui.byTestId('delete-package-confirm'))
	Packages.verifyMessage('Paquete ' + number + ' eliminado correctamente.')

	List<String> audit = Packages.deletionAuditAfter(lastAuditBefore, number)
	Ui.verifyEquals('hay registro de auditoria de la eliminacion', audit != null, true)
	if (audit != null) {
		KeywordUtil.logInfo('Auditoria: fecha y hora=' + audit[0] + ' | cuenta=' + audit[1] + ' | detalle=' + audit[2])
		Ui.verifyEquals('cuenta registrada en la auditoria', audit[1], GlobalVariable.salesEmail)
		Ui.verifyEquals('fecha y hora registradas', audit[0] ==~ /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.*/, true)
		Ui.verifyContains(audit[2], 'Administrador de Ventas')
	}
	Ui.evidence('TC-HU012-06_eliminado')
}
finally {
	WebUI.closeBrowser()
}
