import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import org.openqa.selenium.Keys

final String appUrl = (System.getenv('BLAWDTRACK_APP_URL') ?: 'http://localhost:5173').replaceAll('/+$', '') + '/'
final String superUserEmail = System.getenv('BLAWDTRACK_SUPER_USER_EMAIL')
final String superUserPassword = System.getenv('BLAWDTRACK_SUPER_USER_PASSWORD')
final String documentNumber = '1-2345-6789'
final String expectedFullName = 'Carlos Alejandro Prueba Katalon'

def documentNumberObject = findTestObject('Object Repository/HU007/HU007_Document_Number')
def administratorResultObject = findTestObject('Object Repository/HU007/HU007_Administrator_Result')
def fullNameObject = findTestObject('Object Repository/HU007/HU007_Full_Name')
def searchButtonObject = findTestObject('Object Repository/HU007/HU007_Search_Button')
def successMessageObject = findTestObject('Object Repository/HU007/HU007_Success_Message')

def replaceInputValue = { testObject, String value ->
    WebUI.click(testObject)
    WebUI.sendKeys(testObject, Keys.chord(Keys.CONTROL, 'a'))
    WebUI.sendKeys(testObject, value)
}

assert superUserEmail?.trim() : 'BLAWDTRACK_SUPER_USER_EMAIL no está configurada en el entorno de ejecución.'
assert superUserPassword?.trim() : 'BLAWDTRACK_SUPER_USER_PASSWORD no está configurada en el entorno de ejecución.'

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

WebUI.waitForElementVisible(documentNumberObject, 15)
replaceInputValue(documentNumberObject, documentNumber)
WebUI.click(searchButtonObject)

WebUI.waitForElementVisible(administratorResultObject, 15)
WebUI.verifyElementPresent(administratorResultObject, 5)
WebUI.click(administratorResultObject)

WebUI.comment('Formulario de edición abierto; esperando el campo Nombre completo.')
WebUI.waitForElementVisible(fullNameObject, 15)
String currentFullName = WebUI.getAttribute(fullNameObject, 'value')
boolean updatePerformed = false

if (currentFullName?.trim() == expectedFullName) {
    WebUI.comment("El nombre completo ya estaba almacenado como '${expectedFullName}'. No se realizó ningún cambio de estado.")
} else {
    replaceInputValue(fullNameObject, expectedFullName)
    WebUI.verifyElementAttributeValue(fullNameObject, 'value', expectedFullName, 5)
    WebUI.click(findTestObject('Object Repository/HU007/HU007_Save_Button'))

    WebUI.waitForElementVisible(successMessageObject, 15)
    WebUI.verifyElementPresent(successMessageObject, 5)
    WebUI.comment('El nombre completo fue actualizado correctamente y la aplicación confirmó el guardado.')

    WebUI.comment('Guardado confirmado; usando la lista de búsqueda del formulario de actualización para volver a localizar el administrador.')
    WebUI.waitForElementVisible(documentNumberObject, 15)
    replaceInputValue(documentNumberObject, documentNumber)
    WebUI.click(searchButtonObject)

    WebUI.waitForElementVisible(administratorResultObject, 15)
    WebUI.verifyElementPresent(administratorResultObject, 5)
    WebUI.click(administratorResultObject)

    WebUI.comment('Resultado correcto seleccionado; esperando nuevamente el formulario de edición.')
    boolean editFormVisible = WebUI.waitForElementVisible(fullNameObject, 15)
    if (!editFormVisible) {
        WebUI.comment('El formulario de edición no apareció después de seleccionar el administrador.')
        WebUI.takeScreenshot()
        assert editFormVisible : 'El formulario de edición no apareció después de la búsqueda final.'
    }

    String persistedFullName = WebUI.getAttribute(fullNameObject, 'value')
    assert persistedFullName == expectedFullName :
        "El nombre persistido no coincide. Esperado: '${expectedFullName}'. Actual: '${persistedFullName}'."
    updatePerformed = true
}

if (!updatePerformed) {
    WebUI.comment('No hubo actualización porque el valor esperado ya estaba almacenado; verificando el valor existente mediante una nueva búsqueda.')
    WebUI.waitForElementVisible(documentNumberObject, 15)
    replaceInputValue(documentNumberObject, documentNumber)
    WebUI.click(searchButtonObject)
    WebUI.waitForElementVisible(administratorResultObject, 15)
    WebUI.verifyElementPresent(administratorResultObject, 5)
    WebUI.click(administratorResultObject)
    WebUI.waitForElementVisible(fullNameObject, 15)

    String existingFullName = WebUI.getAttribute(fullNameObject, 'value')
    assert existingFullName == expectedFullName :
        "El nombre existente no coincide. Esperado: '${expectedFullName}'. Actual: '${existingFullName}'."
}

WebUI.closeBrowser()

assert updatePerformed : 'No se realizó una actualización: el nombre esperado ya estaba almacenado. El requisito de cambio de estado no fue probado como una actualización.'