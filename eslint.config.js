import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import unocss from '@unocss/eslint-config/flat'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import globals from 'globals'
import { readFileSync } from 'node:fs'

let autoImportGlobals = {}
try {
	const autoImportData = readFileSync(new URL('./.eslintrc-auto-import.json', import.meta.url), 'utf-8')
	autoImportGlobals = JSON.parse(autoImportData).globals
} catch (error) {}

export default defineConfigWithVueTs(
	{
		ignores: ['**/node_modules/**', '**/dist/**', '**/.husky/**']
	},

	js.configs.recommended,

	...pluginVue.configs['flat/recommended'],

	vueTsConfigs.recommended,

	unocss,

	skipFormatting,

	{
		files: ['**/*.{js,mjs,cjs,ts,vue}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...autoImportGlobals
			}
		},
		rules: {
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

			'vue/multi-word-component-names': 'off',
			'vue/first-attribute-linebreak': 'off',

			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],

			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-expressions': 'off'
		}
	}
)
