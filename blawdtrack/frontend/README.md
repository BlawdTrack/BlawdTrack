# BlawdTrack · Frontend

Aplicación web de BlawdTrack, hecha con **React 19** y **Vite 8**, con **MUI 9** para la interfaz. Para
entender cómo encaja con el backend, ver [`docs/arquitectura.md`](../../docs/arquitectura.md); para el
detalle de cada historia de usuario, [`docs/hu/`](../../docs/hu/README.md).

## Requisitos

- **Node.js** (una versión LTS reciente) y **npm**.
- El **backend** corriendo (ver su [README](../backend/README.md)) para usar la aplicación de verdad.

## Configuración

La URL del backend sale de la variable `VITE_API_URL`, definida en el archivo `.env` de esta carpeta:

```
VITE_API_URL=http://localhost:8080/api
```

Cámbiala si el backend corre en otro puerto o equipo. Todas las llamadas se hacen a
`${VITE_API_URL}/v1/...`.

## Levantar el frontend

Desde esta carpeta (`blawdtrack/frontend`):

```bash
npm install       # la primera vez
npm run dev       # servidor de desarrollo (normalmente http://localhost:5173)
```

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run lint` | Revisa el código con ESLint. |
| `npm test` | Corre todos los tests una sola vez. |

## Estructura

```
src
├── api          axiosClient (base URL + token) y sessionExpiry (401 → cerrar sesión)
├── components   piezas reutilizables: modales, avisos, selectores de rueda, layout del menú
├── config       rutas, roles, navegación por rol, catálogo de la matriz de permisos
├── context      AuthProvider (sesión y usuario)
├── hooks        useAuth, useCourier, useDeactivateMessenger
├── pages        una pantalla por caso de uso
├── services     una función por endpoint del backend
├── utils        lógica pura: errores, validaciones, almacenamiento de sesión
├── App.jsx      tabla de rutas
└── main.jsx     punto de entrada
```

Reglas de la estructura:

- Las pantallas **no llaman a Axios directamente**: usan una función de `src/services`.
- La lógica que se puede probar sin pantalla va en `src/utils`.
- Toda pantalla nueva se agrega a `src/config/routes.js`, a `App.jsx` dentro del grupo de rutas del rol que
  puede verla y, si lleva menú, a `src/config/navigation.js`.
- Los textos que ve el usuario están en español.

## Pruebas

### Tecnologías

- **Vitest 5** como ejecutor, con el entorno **jsdom** (simula el navegador). La configuración está en
  `vite.config.js`.
- **React Testing Library** (`@testing-library/react`) para renderizar y consultar como lo hace el usuario.
- **`@testing-library/jest-dom`** para aserciones de DOM y **`@testing-library/user-event`** para simular
  interacción.
- **`vi.fn()` y `vi.mock()`** de Vitest para simular servicios y hooks (los tests no llaman a la API real).
- **React Router** (`MemoryRouter`) para probar rutas y navegación.

### Cómo correrlos

```bash
npm test                                                    # todos, una sola vez
npm test -- --run src/pages/EditMessenger.test.jsx          # un archivo
npm test -- --run src/utils src/services                    # varias carpetas
npm test -- --run -t "restablece los predeterminados"       # por nombre de test
npx vitest                                                  # modo interactivo (repite al guardar)
```

### Dónde están y cómo escribir uno nuevo

- Cada test vive junto al código que prueba: `Algo.test.jsx` o `algo.test.js`.
- `src/setupTests.js` carga jest-dom y limpia el DOM entre tests. `src/test-utils.jsx` trae
  `renderWithProviders(ui, { route, user, logout })`, que renderiza dentro de un router y de un contexto
  de autenticación controlable, y el usuario de prueba `superUser`.

1. Importa `describe`, `it`, `expect` y `vi` desde `vitest` (los globales están desactivados).
2. Para lógica pura (utilidades, validaciones): un test simple sin render.
3. Para una pantalla: `render(...)` o `renderWithProviders(...)` y busca los elementos por rol o texto, no
   por clases CSS.
4. Simula el backend con `vi.mock('../services/CourierService', () => ({ ... }))` y
   `mockResolvedValue` / `mockRejectedValue`. Incluye **todas** las funciones que el componente importa.
5. Para simular un error del backend usa la forma de Axios:
   `{ response: { status: 409, data: { message: '...' } } }`.
6. Usa `await screen.findBy...` o `waitFor` cuando la pantalla cambia tras una llamada asíncrona.

### Reglas del equipo

- No se modifica un test para que pase: si algo falla, se corrige el código.
- Los textos de la interfaz van en español.

## Más documentación

- [Arquitectura](../../docs/arquitectura.md)
- [Historias de usuario](../../docs/hu/README.md)
