import js from '@eslint/js'
import globals from 'globals'
import pluginReact from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import refreshPlugin from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    // Plugins que estamos usando no projeto
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
      'react-refresh': refreshPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser, // Adiciona variáveis globais de navegador (window, document, etc.)
        ...globals.node,    // Adiciona variáveis de ambiente Node.js (útil para o futuro com Firebase Functions)
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Habilita o parsing de JSX
        },
      },
    },
    // Configurações específicas dos plugins
    settings: {
      react: {
        version: 'detect', // Detecta automaticamente a versão do React instalada
      },
    },
    // Aqui aplicamos os conjuntos de regras e adicionamos as nossas customizações
    rules: {
      // Regras base recomendadas para React e Hooks
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,

      // --- NOSSAS REGRAS PARA UM DESENVOLVIMENTO MAIS TRANQUILO ---
      'react/react-in-jsx-scope': 'off', // Desativa a necessidade de 'import React from "react"'
      'react/prop-types': 'off', // Desativa a obrigatoriedade de prop-types
      'react-refresh/only-export-components': 'warn', // Avisa sobre exports incorretos para HMR
      'no-unused-vars': 'warn', // Avisa sobre variáveis não utilizadas em vez de dar erro
    },
  },
])