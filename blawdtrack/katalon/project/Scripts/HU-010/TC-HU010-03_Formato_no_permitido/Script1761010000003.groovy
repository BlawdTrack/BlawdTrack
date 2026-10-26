import com.blawd.Imports
import com.blawd.Ui
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

// TC-HU010-03: un .pdf o un .txt no se acepta: el navegador avisa del formato, el archivo no queda seleccionado y no
// se puede pasar a la revision. Archivos: hu010-tc03-formato-no-permitido.pdf y .txt.
Ui.login(GlobalVariable.salesEmail, GlobalVariable.salesPassword)
try {
	Ui.openImportPage()

	for (String extension : ['pdf', 'txt']) {
		Ui.selectFile('hu010-tc03-formato-no-permitido.' + extension)

		String alert = Imports.uploadAlertText()
		Ui.verifyContains(alert, 'Formato no compatible')
		Ui.verifyContains(alert, '.xlsx y .csv')

		// No continua: sigue en el paso 1, sin archivo y con "Revisar datos" bloqueado.
		WebUI.verifyElementHasAttribute(Ui.byTestId('import-review'), 'disabled', 5, FailureHandling.CONTINUE_ON_FAILURE)
		WebUI.verifyElementNotPresent(Ui.byTestId('import-count-read'), 5, FailureHandling.CONTINUE_ON_FAILURE)
		Ui.evidence('TC-HU010-03_formato_' + extension)
	}
}
finally {
	WebUI.closeBrowser()
}
