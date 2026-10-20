package com.blawd

import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.util.KeywordUtil

/**
 * Rutas y preparación del entorno de pruebas (carpeta katalon/ del repositorio). El proyecto de Katalon vive en
 * katalon/project, así que los scripts y los archivos de importación están un nivel arriba.
 */
public class Env {

	private static File katalonDir() {
		return new File(RunConfiguration.getProjectDir(), '..').getCanonicalFile()
	}

	/** Ruta absoluta de un archivo de katalon/environment/import-files. */
	static String importFilePath(String fileName) {
		File file = new File(katalonDir(), 'environment/import-files/' + fileName)
		if (!file.exists()) {
			KeywordUtil.markFailedAndStop('No existe el archivo de importación: ' + file.getAbsolutePath())
		}
		return file.getAbsolutePath()
	}

	/** Ruta (sin crear el archivo) de una captura de evidencia en katalon/project/evidence. */
	static String evidencePath(String name) {
		File folder = new File(RunConfiguration.getProjectDir(), 'evidence')
		folder.mkdirs()
		return new File(folder, name + '.png').getAbsolutePath()
	}

	/**
	 * Ejecuta katalon/scripts/prepare-data.ps1: deja las cuentas conocidas y recrea los paquetes E2E-*, de modo que el
	 * caso parta siempre del mismo estado. Requiere el entorno levantado con katalon/scripts/up.ps1.
	 */
	static void prepareData() {
		File script = new File(katalonDir(), 'scripts/prepare-data.ps1')
		Process process = new ProcessBuilder('powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script.getAbsolutePath())
				.redirectErrorStream(true)
				.start()
		String output = process.getInputStream().getText('UTF-8')
		int exitCode = process.waitFor()
		if (exitCode != 0) {
			KeywordUtil.markFailedAndStop('prepare-data.ps1 fallo (código ' + exitCode + '). ¿Está levantado el entorno (up.ps1)?\n' + output)
		}
		KeywordUtil.logInfo('Datos de prueba preparados.')
	}
}
