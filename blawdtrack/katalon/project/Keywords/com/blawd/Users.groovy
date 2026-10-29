package com.blawd

import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.util.KeywordUtil
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

import internal.GlobalVariable

/**
 * Datos y acciones de las HU de usuarios (HU-001 a HU-009): crea mensajeros y administradores únicos por la API,
 * busca por documento en las pantallas, y lee la auditoría del entorno de pruebas. Cada caso crea sus propias
 * cuentas (documento, correo y teléfono únicos), así que se pueden repetir sin reiniciar el entorno; las cuentas
 * compartidas de Profiles/default solo se usan para iniciar sesión.
 */
public class Users {

	/** Contraseña conocida que se fija a las cuentas que crea la prueba (la temporal llega por correo). */
	static final String KNOWN_PASSWORD = 'Katalon2026'

	/** Seis dígitos distintos en cada ejecución, para documentos, teléfonos y correos únicos. */
	static String suffix() {
		return String.format('%06d', (System.nanoTime() / 1000L) % 1000000L)
	}

	/** Datos de un mensajero nuevo (sin crearlo). `tag` va en el nombre y el correo para reconocerlo. */
	static Map courierData(String tag) {
		String suffix = suffix()
		return [documentType: 'CEDULA', documentNumber: '7' + suffix + '00', fullName: 'Mensajero ' + tag + ' ' + suffix,
				email: 'kat.' + tag.toLowerCase() + '.' + suffix + '@blawdgourmet.test', phone: '7' + suffix + '1',
				schedule: '08:00 a 17:00', maxPackageWeightKg: 20]
	}

	/** Datos de un administrador nuevo (sin crearlo). */
	static Map adminData(String tag) {
		String suffix = suffix()
		return [documentType: 'CEDULA', documentNumber: '8' + suffix + '00', fullName: 'Admin ' + tag + ' ' + suffix,
				email: 'kat.' + tag.toLowerCase() + '.' + suffix + '@blawdgourmet.test', phone: '6' + suffix + '1']
	}

	private static String json(Map data) {
		return groovy.json.JsonOutput.toJson(data)
	}

	/** Crea un mensajero por la API, le fija KNOWN_PASSWORD y devuelve sus datos con el `id` y la `password`. */
	static Map createCourier(String tag) {
		Map courier = courierData(tag)
		String token = Api.superToken()
		Map created = Api.call('POST', '/api/v1/couriers', token, json(courier))
		if (created.status != 201) {
			KeywordUtil.markFailedAndStop('No se pudo crear el mensajero de prueba (HTTP ' + created.status + '): ' + created.body)
		}
		courier.id = created.body.id
		courier.password = KNOWN_PASSWORD
		Map password = Api.call('PATCH', '/api/v1/couriers/' + courier.id + '/password', token, json([password: KNOWN_PASSWORD]))
		if (password.status != 204) {
			KeywordUtil.markFailedAndStop('No se pudo fijar la contraseña del mensajero de prueba (HTTP ' + password.status + ').')
		}
		return courier
	}

	/** Cuerpo JSON de `POST /api/v1/admins` con los datos de `adminData`. */
	static String adminJson(Map admin) {
		return json([nombreCompleto: admin.fullName, numeroTelefono: admin.phone, correoElectronico: admin.email,
				documentType: admin.documentType, documentNumber: admin.documentNumber])
	}

	/** Crea un administrador de ventas por la API, le fija KNOWN_PASSWORD y devuelve sus datos. */
	static Map createAdmin(String tag) {
		Map admin = adminData(tag)
		String token = Api.superToken()
		Map created = Api.call('POST', '/api/v1/admins', token, json([nombreCompleto: admin.fullName, numeroTelefono: admin.phone,
				correoElectronico: admin.email, documentType: admin.documentType, documentNumber: admin.documentNumber]))
		if (created.status != 201) {
			KeywordUtil.markFailedAndStop('No se pudo crear el administrador de prueba (HTTP ' + created.status + '): ' + created.body)
		}
		Map password = Api.call('PATCH', '/api/v1/admins/CEDULA/' + admin.documentNumber, token, json([password: KNOWN_PASSWORD]))
		if (password.status != 200) {
			KeywordUtil.markFailedAndStop('No se pudo fijar la contraseña del administrador de prueba (HTTP ' + password.status + ').')
		}
		admin.password = KNOWN_PASSWORD
		return admin
	}

	/** Desactiva un mensajero por la API (la misma llamada que hace la pantalla "Desactivar mensajero"). */
	static void deactivateCourier(Map courier) {
		Map result = Api.call('PATCH', '/api/v1/couriers/' + courier.id + '/deactivate', Api.superToken())
		if (result.status != 200) {
			KeywordUtil.markFailedAndStop('No se pudo desactivar al mensajero de prueba (HTTP ' + result.status + ').')
		}
	}

	// ---------- Pantallas ----------

	/** Campo "Número de documento" de las pantallas con búsqueda por documento. */
	static TestObject documentField() {
		return Ui.css("input[aria-label='Número de documento']", 'campo-numero-documento')
	}

	/** Busca por número de documento (el tipo por defecto es Cédula) y pulsa "Buscar". */
	static void searchByDocument(String documentNumber) {
		WebUI.waitForElementVisible(documentField(), Packages.TIMEOUT)
		WebUI.setText(documentField(), documentNumber)
		WebUI.click(Ui.byTestId('document-search-submit'))
	}

	/** Abre una pantalla del menú por su ruta y espera al campo de búsqueda por documento. */
	static void openSearchPage(String path) {
		WebUI.navigateToUrl(GlobalVariable.baseUrl + path)
		WebUI.waitForElementVisible(documentField(), Packages.TIMEOUT)
	}

	/** Botón de la fila del resultado (por ejemplo "Desactivar" o "Eliminar"); la búsqueda deja un solo resultado. */
	static TestObject resultButton(String text) {
		return Packages.xpath("//main//button[normalize-space(.)='" + text + "']", 'boton-' + text)
	}

	// ---------- Auditoría (base de pruebas) ----------

	/**
	 * Registro de auditoría de esa acción creado después de `afterId` cuyo detalle contiene `detail`, con la cuenta
	 * que lo hizo. @return [fecha_hora, correo del responsable, detalle], o null si no hay.
	 */
	static List<String> auditAfter(long afterId, String action, String detail) {
		List<List<String>> rows = Packages.query(
				"SELECT a.fecha_hora, u.correo, a.detalle FROM auditorias a JOIN usuarios u ON u.id = a.usuario_id " +
				"WHERE a.accion = '" + action + "' AND a.id > " + afterId + " AND a.detalle LIKE '%" + detail + "%' " +
				'ORDER BY a.id DESC LIMIT 1')
		return rows ? rows[0] : null
	}

	/**
	 * Registro de auditoría de esa acción creado después de `afterId` sobre la cuenta con ese correo (la de los mensajeros
	 * no repite el documento en el detalle). @return [fecha_hora, correo del responsable, detalle], o null si no hay.
	 */
	static List<String> auditForUserAfter(long afterId, String action, String affectedEmail) {
		List<List<String>> rows = Packages.query(
				"SELECT a.fecha_hora, u.correo, a.detalle FROM auditorias a JOIN usuarios u ON u.id = a.usuario_id " +
				"JOIN usuarios t ON t.id = a.usuario_afectado_id WHERE a.accion = '" + action + "' AND a.id > " + afterId +
				" AND t.correo = '" + affectedEmail + "' ORDER BY a.id DESC LIMIT 1")
		return rows ? rows[0] : null
	}

	/** Valor de una columna de `usuarios` (por ejemplo `estado` o `rol_id`) de la cuenta con ese correo. */
	static String userColumn(String column, String email) {
		List<List<String>> rows = Packages.query('SELECT ' + column + " FROM usuarios WHERE correo = '" + email + "'")
		return rows ? rows[0][0] : null
	}

	// ---------- Formularios de las HU de usuarios ----------

	/** Abre "Crear mensajero" (con la sesión del Súper Usuario iniciada) y espera el formulario. */
	static void openCourierForm() {
		Ui.goTo('/main-menu/couriers/new')
		WebUI.waitForElementVisible(Ui.field('fullName'), Packages.TIMEOUT)
	}

	/** Llena el formulario de "Crear mensajero" con esos datos (horario 9:00 am a 12:00 pm y 5 kg), sin enviarlo. */
	static void fillCourierForm(Map courier) {
		Ui.type('fullName', courier.fullName)
		Ui.type('email', courier.email)
		Ui.type('phone', courier.phone)
		Ui.type('documentNumber', courier.documentNumber)
		Ui.pickWeight("input[aria-label='Capacidad máxima de carga']", 'Capacidad máxima de carga', '5')
		Ui.pickTime('#schedule', 'Hora de entrada', '09', '00', 'am')
		Ui.pickTime('#scheduleEnd', 'Hora de salida', '12', '00', 'pm')
	}

	/** Registra un mensajero desde la pantalla y espera el aviso de éxito. */
	static void registerCourierThroughUi(Map courier) {
		openCourierForm()
		fillCourierForm(courier)
		WebUI.click(Ui.byTestId('form-submit'))
		Packages.verifyMessage('Mensajero creado correctamente. Se envió un correo a ' + courier.email)
	}

	/** Abre "Crear administrador" (con la sesión del Súper Usuario iniciada) y espera el formulario. */
	static void openAdminForm() {
		Ui.goTo('/main-menu/admins/new')
		WebUI.waitForElementVisible(Ui.field('nombreCompleto'), Packages.TIMEOUT)
	}

	/** Llena el formulario de "Crear administrador" con esos datos, sin enviarlo. */
	static void fillAdminForm(Map admin) {
		Ui.type('nombreCompleto', admin.fullName)
		Ui.type('correoElectronico', admin.email)
		Ui.type('numeroTelefono', admin.phone)
		Ui.type('documentNumber', admin.documentNumber)
	}

	/** Registra un administrador desde la pantalla y espera el aviso de éxito. */
	static void registerAdminThroughUi(Map admin) {
		openAdminForm()
		fillAdminForm(admin)
		WebUI.click(Ui.byTestId('form-submit'))
		Packages.verifyMessage('Administrador creado correctamente. Se envió un correo a ' + admin.email)
	}

	/** En "Actualizar mensajero": busca por documento, abre el mensajero de la lista y espera su formulario. */
	static void openCourierForEdit(String documentNumber) {
		openSearchPage('/editar-mensajero')
		searchByDocument(documentNumber)
		TestObject row = Packages.xpath("//main//table//tbody//tr[contains(normalize-space(.), '" + documentNumber + "')]", 'fila-' + documentNumber)
		WebUI.waitForElementVisible(row, Packages.TIMEOUT)
		WebUI.click(row)
		WebUI.waitForElementVisible(Ui.byTestId('edit-save'), Packages.TIMEOUT)
	}

	/** Nombre del rol de la cuenta con ese correo (SUPER_USUARIO, ADMIN_VENTAS o MENSAJERO). */
	static String roleOf(String email) {
		List<List<String>> rows = Packages.query("SELECT r.nombre FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.correo = '" + email + "'")
		return rows ? rows[0][0] : null
	}

	// ---------- Roles y permisos (HU-009) ----------

	/** Casilla de un permiso por su nombre (su etiqueta empieza con "Nombre:" y termina con permitido o denegado). */
	static TestObject permissionBox(String name) {
		return Ui.css("input[aria-label^='" + name + ":']", 'permiso-' + name)
	}

	/** Estado de un permiso en la matriz: lo que dice su etiqueta (`Nombre: permitido` o `Nombre: denegado`). */
	static String permissionState(String name) {
		return WebUI.getAttribute(permissionBox(name), 'aria-label')
	}

	/** Abre "Roles y permisos", busca a la persona por documento y espera la matriz. */
	static void openPermissions(String documentNumber) {
		openSearchPage('/gestion-roles')
		searchByDocument(documentNumber)
		WebUI.waitForElementPresent(Ui.css("input[type='checkbox'][aria-label*=':']", 'matriz'), Packages.TIMEOUT)
	}

	/** Deja al Administrador de Ventas compartido con los permisos predeterminados de su rol (por la API). */
	static void resetSalesPermissions() {
		Api.call('DELETE', '/api/v1/users/CEDULA/900000001/permissions', Api.superToken())
	}
}
