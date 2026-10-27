import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import org.openqa.selenium.Keys

final String appUrl = (System.getenv('BLAWDTRACK_APP_URL') ?: 'http://localhost:5173').replaceAll('/+$', '') + '/'
final String superUserEmail = System.getenv('BLAWDTRACK_SUPER_USER_EMAIL')
final String superUserPassword = System.getenv('BLAWDTRACK_SUPER_USER_PASSWORD')
final String documentNumber = '1-2345-6789'
final String originalEmail = 'carlos.katalon@example.com'
final String newEmail = 'carlos.actualizado.katalon@example.com'

assert originalEmail != newEmail :
    'La prueba requiere correos original y nuevo diferentes.'
assert superUserEmail?.trim() :
    'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() :
    'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'

def documentNumberObject = findTestObject('Object Repository/HU007/HU007_Document_Number')
def administratorResultObject = findTestObject('Object Repository/HU007/HU007_Administrator_Result')
def fullNameObject = findTestObject('Object Repository/HU007/HU007_Full_Name')
def emailObject = findTestObject('Object Repository/HU007/HU007_Email')
def accessStatusObject = findTestObject('Object Repository/HU007/HU007_Access_Status')
def searchButtonObject = findTestObject('Object Repository/HU007/HU007_Search_Button')
def successMessageObject = findTestObject('Object Repository/HU007/HU007_Success_Message')
def saveButtonObject = findTestObject('Object Repository/HU007/HU007_Save_Button')

def replaceInputValue = { testObject, String value ->
    WebUI.click(testObject)
    WebUI.sendKeys(testObject, Keys.chord(Keys.CONTROL, 'a'))
    WebUI.sendKeys(testObject, value)
}

def readAccessStatus = {
    def accessStatusElement = WebUI.findWebElement(accessStatusObject, 15)
    return accessStatusElement.isSelected() as Boolean
}

def waitForDocumentSearchField = {
    boolean visible = WebUI.waitForElementVisible(documentNumberObject, 15)
    boolean clickable = visible && WebUI.waitForElementClickable(documentNumberObject, 15)

    if (!visible || !clickable) {
        WebUI.comment("No se encontró un campo de documento visible e interactuable. URL actual: ${WebUI.getUrl()}")
        WebUI.takeScreenshot()
    }

    assert visible && clickable :
        "El campo de documento no está disponible para la búsqueda. " +
        "URL actual: '${WebUI.getUrl()}'. Visible: ${visible}. Interactuable: ${clickable}."
}

def searchAdministrator = {
    // La pantalla Actualizar administrador mantiene la lista de búsqueda después del guardado.
    // Esperar el campo garantiza que la segunda búsqueda no intente usar el formulario de edición.
    waitForDocumentSearchField()
    replaceInputValue(documentNumberObject, documentNumber)

    WebUI.verifyElementAttributeValue(
        documentNumberObject,
        'value',
        documentNumber,
        5
    )

    WebUI.click(searchButtonObject)

    assert WebUI.waitForElementVisible(administratorResultObject, 15) :
        "No apareció el administrador '${documentNumber}' después de la búsqueda. " +
        "URL actual: '${WebUI.getUrl()}'."

    WebUI.verifyElementPresent(administratorResultObject, 5)
    WebUI.click(administratorResultObject)
}

WebUI.openBrowser('')
WebUI.navigateToUrl(appUrl)
WebUI.waitForPageLoad(15)

WebUI.waitForElementVisible(findTestObject('Object Repository/HU007/HU007_Login_Email'), 15)
WebUI.setText(findTestObject('Object Repository/HU007/HU007_Login_Email'), superUserEmail)
WebUI.setText(findTestObject('Object Repository/HU007/HU007_Login_Password'), superUserPassword)
WebUI.click(findTestObject('Object Repository/HU007/HU007_Login_Submit'))

WebUI.waitForElementVisible(findTestObject('Object Repository/HU007/HU007_User_Menu'), 20)
WebUI.click(findTestObject('Object Repository/HU007/HU007_User_Menu'))
WebUI.waitForElementVisible(findTestObject('Object Repository/HU007/HU007_Administrators_Menu'), 10)
WebUI.click(findTestObject('Object Repository/HU007/HU007_Administrators_Menu'))
WebUI.waitForElementVisible(findTestObject('Object Repository/HU007/HU007_Update_Administrator'), 10)
WebUI.click(findTestObject('Object Repository/HU007/HU007_Update_Administrator'))

searchAdministrator()

WebUI.waitForElementVisible(emailObject, 15)
WebUI.waitForElementVisible(fullNameObject, 15)
WebUI.waitForElementVisible(accessStatusObject, 15)

String originalFullName = WebUI.getAttribute(fullNameObject, 'value')
String currentEmail = WebUI.getAttribute(emailObject, 'value')
boolean accessStatusBefore = readAccessStatus()

assert currentEmail == originalEmail :
    "El correo actual no coincide con el valor original. Esperado: '${originalEmail}'. Actual: '${currentEmail}'."
assert currentEmail != newEmail :
    "No se realizó ningún cambio: el correo nuevo ya estaba almacenado. Actual: '${currentEmail}'."

replaceInputValue(emailObject, newEmail)
WebUI.verifyElementAttributeValue(emailObject, 'value', newEmail, 5)
String enteredEmail = WebUI.getAttribute(emailObject, 'value')
assert enteredEmail == newEmail :
    "El valor del correo antes de guardar no coincide. Esperado: '${newEmail}'. Actual: '${enteredEmail}'."

WebUI.click(saveButtonObject)
WebUI.waitForElementVisible(successMessageObject, 15)
WebUI.verifyElementPresent(successMessageObject, 5)

searchAdministrator()

WebUI.waitForElementVisible(emailObject, 15)
WebUI.waitForElementVisible(fullNameObject, 15)
WebUI.waitForElementVisible(accessStatusObject, 15)

String persistedEmail = WebUI.getAttribute(emailObject, 'value')
String persistedFullName = WebUI.getAttribute(fullNameObject, 'value')
boolean accessStatusAfter = readAccessStatus()

assert persistedEmail == newEmail :
    "El correo persistido no coincide exactamente. Esperado: '${newEmail}'. Actual: '${persistedEmail}'."
assert persistedFullName == originalFullName :
    "El nombre completo fue alterado inesperadamente. Original: '${originalFullName}'. Actual: '${persistedFullName}'."
assert accessStatusAfter == accessStatusBefore :
    "El estado de acceso fue alterado inesperadamente. Antes: '${accessStatusBefore}'. Después: '${accessStatusAfter}'."

WebUI.closeBrowser()
