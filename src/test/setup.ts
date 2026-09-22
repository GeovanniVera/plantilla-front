import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { server } from './mocks/server';

/*
 * Los awaits de Testing Library usan 1000 ms por defecto. En el runner de CI
 * (2 cores, con el proyecto de browser corriendo en paralelo) ese presupuesto se
 * agota y estos tests de integración —que esperan la restauración de sesión y
 * rutas cargadas por lazy— fallan por timeout, no por lógica: se midió setup
 * 52 s e import 61 s agregados en el mismo run. Se amplía el presupuesto de
 * `findBy*`/`waitFor`, que sigue siendo finito y muy por debajo del testTimeout.
 */
configure({ asyncUtilTimeout: 5000 });

/*
 * `localStorage`/`sessionStorage` no existen en este entorno: jsdom 30 no los
 * expone y el warning de Node ("localStorage is not available...") aparece sólo
 * en algunas versiones. `authStorage` los usa con try/catch silencioso, así que
 * sin ellos la persistencia de sesión no se ejercita y el resultado de los
 * tests depende del runtime: en Node 22 el storage existe y un login filtra la
 * sesión al test siguiente (que entonces renderiza <Navigate /> en vez del
 * formulario), mientras que en Node 26 el storage no hace nada y el mismo test
 * pasa. Se instala un storage en memoria para que el entorno sea hermético y se
 * comporte como el navegador, en cualquier versión de Node.
 */
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

// Hermetic en cualquier runtime: se instala siempre, no sólo si falta.
Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage(),
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: memoryStorage(),
  configurable: true,
  writable: true,
});

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Aislamiento entre tests: sin esto, una sesión iniciada en un caso se filtra
// al siguiente y los guards redirigen en vez de renderizar la página.
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
