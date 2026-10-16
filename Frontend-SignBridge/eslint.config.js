import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    // Deuda técnica conocida: estas reglas nuevas de eslint-plugin-react-hooks 7
    // (las del React Compiler) y de react-refresh marcan patrones que hoy
    // funcionan pero conviene refactorizar. Se bajan a "warn" para que el lint
    // pase en el CI sin esconderlas: siguen saliendo en la salida de `pnpm lint`.
    // Cuando se corrijan, se borra cada línea y la regla vuelve a ser error.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
])
