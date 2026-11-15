/*
 * Copyright (C) 2026  Henrique Almeida
 * This file is part of Portfolio.
 *
 * Portfolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Portfolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.
 */

import js from '@eslint/js'
import { configs as astroConfigs } from 'eslint-plugin-astro'
import { flatConfigs as importXConfigs } from 'eslint-plugin-import-x'
import jestDom from 'eslint-plugin-jest-dom'
import promise from 'eslint-plugin-promise'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import testingLibrary from 'eslint-plugin-testing-library'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import { configs as tseslintConfigs } from 'typescript-eslint'

export default [
  { ignores: ['dist', 'coverage', '.astro'] },
  js.configs.recommended,
  ...tseslintConfigs.recommended,
  ...astroConfigs.recommended,
  ...astroConfigs['jsx-a11y-recommended'],
  importXConfigs.recommended,
  importXConfigs.typescript,
  promise.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,astro}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',
    },
  },
  {
    files: ['**/*.config.{js,ts}', 'vitest.config.browser.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.ts', 'src/test/**/*.ts'],
    plugins: {
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
    },
    rules: {
      ...testingLibrary.configs['flat/dom'].rules,
      ...jestDom.configs['flat/recommended'].rules,
      'testing-library/no-node-access': 'off',
    },
  },
]
