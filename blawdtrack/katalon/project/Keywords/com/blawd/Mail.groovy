package com.blawd

import com.kms.katalon.core.util.KeywordUtil

import groovy.json.JsonSlurper
import internal.GlobalVariable

/**
 * Lee los correos que el backend del entorno de pruebas envía a Mailpit (http://localhost:8025): el enlace de
 * recuperación de contraseña y la contraseña temporal de las cuentas nuevas. Cada caso usa un correo propio, así que
 * no hace falta vaciar la bandeja.
 */
public class Mail {

	/** Partes del asunto de cada correo que envía el backend. */
	static final String SUBJECT_RECOVERY = 'enlace de recuperación'
	static final String SUBJECT_WELCOME = 'bienvenida'

	private static Object getJson(String path) {
		HttpURLConnection connection = (HttpURLConnection) new URL(GlobalVariable.mailUrl + path).openConnection()
		connection.setRequestMethod('GET')
		connection.setConnectTimeout(5000)
		connection.setReadTimeout(10000)
		return new JsonSlurper().parseText(connection.getInputStream().getText('UTF-8'))
	}

	/**
	 * Mensajes enviados a ese correo, del más nuevo al más antiguo: cada uno trae `ID` y `Subject`. Con `subjectPart` solo
	 * los que lo tienen en el asunto: una cuenta nueva ya recibe un correo de bienvenida, que no es el de recuperación.
	 */
	static List<Map> messagesTo(String address, String subjectPart = null) {
		Map result = (Map) getJson('/api/v1/search?query=' + URLEncoder.encode('to:' + address, 'UTF-8'))
		List<Map> messages = (List<Map>) (result.messages ?: [])
		return subjectPart == null ? messages : messages.findAll { ((it.Subject ?: '') as String).contains(subjectPart) }
	}

	static int countTo(String address, String subjectPart = null) {
		return messagesTo(address, subjectPart).size()
	}

	/** Espera a que haya al menos `count` mensajes (con ese asunto, si se indica) y devuelve el más nuevo. */
	static Map waitForMessage(String address, int count = 1, int timeoutSeconds = 40, String subjectPart = null) {
		long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L
		while (System.currentTimeMillis() < deadline) {
			List<Map> messages = messagesTo(address, subjectPart)
			if (messages.size() >= count) {
				return messages[0]
			}
			Thread.sleep(1000)
		}
		KeywordUtil.markFailedAndStop('No llegó el correo a ' + address + ' en ' + timeoutSeconds + ' segundos (Mailpit).')
		return null
	}

	/** Texto plano de un mensaje. */
	static String textOf(Map message) {
		Map full = (Map) getJson('/api/v1/message/' + message.ID)
		return full.Text as String
	}

	/** Enlace de recuperación del correo más nuevo (o el n-ésimo, esperándolo) enviado a ese correo. */
	static String recoveryLink(String address, int count = 1) {
		String text = textOf(waitForMessage(address, count, 40, SUBJECT_RECOVERY))
		def matcher = (text =~ /(https?:\/\/\S+\/recovery\?token=[^\s"<>]+)/)
		if (!matcher.find()) {
			KeywordUtil.markFailedAndStop('El correo no trae el enlace de recuperación: ' + text)
		}
		return matcher.group(1)
	}

	/** Contraseña temporal del correo de bienvenida enviado a ese correo. */
	static String temporaryPassword(String address) {
		String text = textOf(waitForMessage(address, 1, 40, SUBJECT_WELCOME))
		def matcher = (text =~ /Contraseña temporal:\s*(\S+)/)
		if (!matcher.find()) {
			KeywordUtil.markFailedAndStop('El correo no trae la contraseña temporal: ' + text)
		}
		return matcher.group(1)
	}
}
