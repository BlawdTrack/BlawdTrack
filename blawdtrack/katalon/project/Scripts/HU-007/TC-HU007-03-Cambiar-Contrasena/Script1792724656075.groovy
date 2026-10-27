import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import org.openqa.selenium.Keys

final String appUrl = (System.getenv('BLAWDTRACK_APP_URL') ?: 'http://localhost:5173').replaceAll('/+$', '') + '/'
final String expectedAuthenticatedUrl = appUrl + 'main-menu'
final String superUserEmail = System.getenv('BLAWDTRACK_SUPER_USER_EMAIL')
final String superUserPassword = System.getenv('BLAWDTRACK_SUPER_USER_PASSWORD')
final String administratorEmail = 'carlos.actualizado.katalon@example.com'
final String documentNumber = '1-2345-6789'
final String originalPassword = System.getenv('BLAWDTRACK_ADMIN_ORIGINAL_PASSWORD')
final String newPassword = System.getenv('BLAWDTRACK_ADMIN_NEW_PASSWORD')

assert superUserEmail?.trim() : 'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() : 'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'
assert originalPassword?.trim() : 'BLAWDTRACK_ADMIN_ORIGINAL_PASSWORD no está configurada en el entorno de ejecución.'
assert newPassword?.trim() : 'BLAWDTRACK_ADMIN_NEW_PASSWORD no está configurada en el entorno de ejecución.'
assert originalPassword != newPassword : 'La contraseña original y la nueva deben ser diferentes.'

final def loginEmailObject = findTestObject('Object Repository/HU007/HU007_Login_Email')
final def loginPasswordObject = findTestObject('Object Repository/HU007/HU007_Login_Password')
final def loginSubmitObject = findTestObject('Object Repository/HU007/HU007_Login_Submit')
final def userMenuObject = findTestObject('Object Repository/HU007/HU007_User_Menu')
final def administratorsMenuObject = findTestObject('Object Repository/HU007/HU007_Administrators_Menu')
final def updateAdministratorObject = findTestObject('Object Repository/HU007/HU007_Update_Administrator')
final def documentNumberObject = findTestObject('Object Repository/HU007/HU007_Document_Number')
final def administratorResultObject = findTestObject('Object Repository/HU007/HU007_Administrator_Result')
final def fullNameObject = findTestObject('Object Repository/HU007/HU007_Full_Name')
final def emailObject = findTestObject('Object Repository/HU007/HU007_Email')
final def accessStatusObject = findTestObject('Object Repository/HU007/HU007_Access_Status')
final def passwordObject = findTestObject('Object Repository/HU007/HU007_Admin_Password')
final def searchButtonObject = findTestObject('Object Repository/HU007/HU007_Search_Button')
final def saveButtonObject = findTestObject('Object Repository/HU007/HU007_Save_Button')
final def successMessageObject = findTestObject('Object Repository/HU007/HU007_Success_Message')
final def loginErrorObject = findTestObject('Object Repository/HU007/HU007_Login_Error')

final def replaceInputValue = { testObject, String value ->
    WebUI.click(testObject)
    WebUI.sendKeys(testObject, Keys.chord(Keys.CONTROL, 'a'))
    WebUI.sendKeys(testObject, value)
}

// Use Selenium keyboard input so React-controlled inputs receive normal user-like events.
// The secret is passed directly to the WebElement and is never included in an assertion message.
final def enterSecret = { testObject, String secret ->
    assert WebUI.waitForElementVisible(testObject, 15) : 'El campo de contraseña no está disponible.'
    final def element = WebUI.findWebElement(testObject, 15)
    element.clear()
    element.sendKeys(secret)
    assert element.getAttribute('value')?.length() > 0 : 'La contraseña no fue ingresada en el campo protegido.'
}

final def login = { String email, String password ->
    WebUI.openBrowser('')
    WebUI.navigateToUrl(appUrl)
    WebUI.waitForPageLoad(15)
    assert WebUI.waitForElementVisible(loginEmailObject, 15) : 'El formulario de autenticación no está disponible.'
    assert WebUI.waitForElementVisible(loginPasswordObject, 15) : 'El campo de contraseña no está disponible.'

    final def emailElement = WebUI.findWebElement(loginEmailObject, 15)
    emailElement.clear()
    emailElement.sendKeys(email)
    assert emailElement.getAttribute('value') == email : 'El correo del usuario no fue ingresado correctamente.'

    enterSecret(loginPasswordObject, password)
    WebUI.click(loginSubmitObject)
}

final def waitForAuthenticatedRoute = {
    boolean reachedAuthenticatedRoute = false
    for (int second = 0; second < 20; second++) {
        WebUI.delay(1)
        final String currentUrl = WebUI.getUrl().replaceAll('/+$', '')
        if (currentUrl == expectedAuthenticatedUrl) {
            reachedAuthenticatedRoute = true
            break
        }
    }

    if (!reachedAuthenticatedRoute) {
        final String diagnostic = WebUI.verifyElementPresent(loginErrorObject, 2,
            com.kms.katalon.core.model.FailureHandling.OPTIONAL)
            ? 'El formulario mostró un error de autenticación.'
            : 'No se observó la ruta autenticada ni un mensaje visible de autenticación.'
        assert false : diagnostic
    }
}

final def searchAdministrator = {
    assert WebUI.waitForElementVisible(documentNumberObject, 15) : 'El campo de documento no está disponible para buscar el administrador.'
    assert WebUI.waitForElementClickable(documentNumberObject, 15) : 'El campo de documento no está interactuable.'
    replaceInputValue(documentNumberObject, documentNumber)
    WebUI.verifyElementAttributeValue(documentNumberObject, 'value', documentNumber, 5)
    WebUI.click(searchButtonObject)
    assert WebUI.waitForElementVisible(administratorResultObject, 15) : "No apareció el administrador '${documentNumber}'."
    WebUI.click(administratorResultObject)
}

// 1. Login como Super User y navegación reutilizada de HU007-01/HU007-02.
login(superUserEmail, superUserPassword)
assert WebUI.waitForElementVisible(userMenuObject, 20) : 'El login del Super User no llevó al menú autenticado.'
WebUI.click(userMenuObject)
assert WebUI.waitForElementVisible(administratorsMenuObject, 10) : 'No apareció el menú de administradores.'
WebUI.click(administratorsMenuObject)
assert WebUI.waitForElementVisible(updateAdministratorObject, 10) : 'No apareció la opción Actualizar administrador.'
WebUI.click(updateAdministratorObject)

// 2. Localizar el administrador y capturar los datos que no deben cambiar.
searchAdministrator()
WebUI.waitForElementVisible(emailObject, 15)
WebUI.waitForElementVisible(fullNameObject, 15)
WebUI.waitForElementVisible(accessStatusObject, 15)
WebUI.waitForElementVisible(passwordObject, 15)

String originalEmail = WebUI.getAttribute(emailObject, 'value')
String originalFullName = WebUI.getAttribute(fullNameObject, 'value')
boolean originalAccessStatus = WebUI.findWebElement(accessStatusObject, 15).isSelected() as Boolean
assert originalEmail == administratorEmail : "El correo actual no coincide. Esperado: '${administratorEmail}'. Actual: '${originalEmail}'."
assert !(WebUI.getAttribute(passwordObject, 'value') ?: '').trim() : 'La contraseña existente no debe exponerse en el formulario.'

// 3. Cambiar solamente la contraseña y confirmar la respuesta de éxito.
enterSecret(passwordObject, newPassword)
WebUI.click(saveButtonObject)
assert WebUI.waitForElementVisible(successMessageObject, 15) : 'No apareció la respuesta de actualización exitosa.'
WebUI.verifyElementPresent(successMessageObject, 5)

// 4. Releer el registro y comprobar que los demás datos siguen intactos.
searchAdministrator()
WebUI.waitForElementVisible(emailObject, 15)
WebUI.waitForElementVisible(fullNameObject, 15)
WebUI.waitForElementVisible(accessStatusObject, 15)
assert WebUI.getAttribute(emailObject, 'value') == originalEmail : 'El correo fue alterado inesperadamente.'
assert WebUI.getAttribute(fullNameObject, 'value') == originalFullName : 'El nombre completo fue alterado inesperadamente.'
assert (WebUI.findWebElement(accessStatusObject, 15).isSelected() as Boolean) == originalAccessStatus : 'El estado de acceso fue alterado inesperadamente.'
WebUI.closeBrowser()

// 5. La contraseña anterior debe ser rechazada.
login(administratorEmail, originalPassword)
assert WebUI.waitForElementVisible(loginErrorObject, 15) : 'No se mostró el rechazo de login con la contraseña anterior.'
WebUI.verifyElementPresent(loginErrorObject, 5)
assert !WebUI.verifyElementPresent(userMenuObject, 3, com.kms.katalon.core.model.FailureHandling.OPTIONAL) : 'La contraseña anterior todavía permite iniciar sesión.'
WebUI.closeBrowser()

// 6. La nueva contraseña debe permitir el acceso como Administrador de Ventas.
login(administratorEmail, newPassword)
waitForAuthenticatedRoute()

final String authenticatedUrl = WebUI.getUrl().replaceAll('/+$', '')
assert authenticatedUrl == expectedAuthenticatedUrl : "La nueva contraseña no llevó a la ruta autenticada esperada. Ruta actual: '${authenticatedUrl}'."
assert WebUI.verifyTextPresent('Administrador de Ventas', false) : 'La nueva contraseña no mostró la interfaz autenticada del Administrador de Ventas.'

final boolean logoutButtonPresent = WebUI.executeJavaScript(
    "return document.querySelector('[data-testid=\\\"logout-button\\\"]') !== null;",
    []
) as Boolean
assert logoutButtonPresent : 'No existe el botón de cierre de sesión de la interfaz autenticada.'
WebUI.closeBrowser()
