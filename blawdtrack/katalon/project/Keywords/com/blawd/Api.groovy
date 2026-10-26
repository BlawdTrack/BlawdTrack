package com.blawd

import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.ResponseObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.impl.HttpTextBodyContent
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS

import groovy.json.JsonSlurper
import internal.GlobalVariable

/** Llamadas al backend del entorno de pruebas para comprobar el acceso por API además de la interfaz. */
public class Api {

	private static RequestObject request(String method, String path, List<TestObjectProperty> headers, String body = null) {
		RequestObject request = new RequestObject()
		request.setRestUrl(GlobalVariable.apiUrl + path)
		request.setRestRequestMethod(method)
		request.setHttpHeaderProperties(headers)
		if (body != null) {
			request.setBodyContent(new HttpTextBodyContent(body, 'UTF-8', 'application/json'))
		}
		return request
	}

	private static TestObjectProperty header(String name, String value) {
		return new TestObjectProperty(name, ConditionType.EQUALS, value)
	}

	/** Inicia sesión por la API y devuelve el token JWT. */
	static String tokenFor(String email, String password) {
		String body = '{"email":"' + email + '","password":"' + password + '"}'
		ResponseObject response = WS.sendRequest(request('POST', '/api/v1/auth/login', [header('Content-Type', 'application/json')], body))
		WS.verifyResponseStatusCode(response, 200)
		return new JsonSlurper().parseText(response.getResponseText()).token
	}

	/** Código HTTP de una petición con el token de una sesión. */
	static int statusOf(String method, String path, String token, String body = null) {
		List<TestObjectProperty> headers = [header('Authorization', 'Bearer ' + token), header('Content-Type', 'application/json')]
		ResponseObject response = WS.sendRequest(request(method, path, headers, body))
		return response.getStatusCode()
	}
}
