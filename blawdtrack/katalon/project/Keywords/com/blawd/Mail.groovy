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

	private static Object getJson(String path) {
		HttpURLConnection connection = (HttpURLConnection) new URL(GlobalVariable.mailUrl + path).openConnection()
		connection.setRequestMethod('GET')
		connection.setConnectTimeout(5000)
		connection.setReadTimeout(10000)
		return new JsonSlurper().parseText(connection.getInputStream().getText('UTF-8'))
	}

	/** Mensajes enviados a ese correo, del más nuevo al más antiguo: cada uno trae `ID` y `Subject`. */
	static List<Map> messagesTo(String address) {
		Map result = (Map) getJson('/api/v1/search?query=' + URLEncoder.encode('to:' + address, 'UTF-8'))
		return (List<Map>) (result.messages ?: [])
	}

	static int countTo(String address) {
		return messagesTo(address).size()
	}

	/** Espera a que haya al menos `count` mensajes para ese correo y devuelve el más nuevo. */
	static Map waitForMessage(String address, int count = 1, int timeoutSeconds = 40) {
		long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L
		while (System.currentTimeMillis() < deadline) {
			List<Map> messages = messagesTo(address)
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
		String text = textOf(waitForMessage(address, count))
		def matcher = (text =~ /(https?:\/\/\S+\/recovery\?token=[^\s"<>]+)/)
		if (!matcher.find()) {
			KeywordUtil.markFailedAndStop('El correo no trae el enlace de recuperación: ' + text)
		}
		return matcher.group(1)
	}

	/** Contraseña temporal del correo de bienvenida enviado a ese correo. */
	static String temporaryPassword(String address) {
		String text = textOf(waitForMessage(address))
		def matcher = (text =~ /Contraseña temporal:\s*(\S+)/)
		if (!matcher.find()) {
			KeywordUtil.markFailedAndStop('El correo no trae la contraseña temporal: ' + text)
		}
		return matcher.group(1)
	}
}
