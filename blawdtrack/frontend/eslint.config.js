import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // Señales de SOLID/POO: una página es composición, no un archivo gigante.
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 4],
      complexity: ['error', 15],
      'max-depth': ['error', 4],
    },
  },
  {
    // Los tests y la configuración de datos (rutas, tema) son largos por naturaleza.
    files: ['**/*.test.{js,jsx}', 'src/theme.js', 'src/config/**'],
    rules: { 'max-lines': 'off', complexity: 'off' },
  },
])
