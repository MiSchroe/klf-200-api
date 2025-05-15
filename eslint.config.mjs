import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
	js.configs.recommended,
	tseslint.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		// languageOptions: {
		// 	parser: tseslint.parser,
		// 	ecmaVersion: 2022,
		// 	sourceType: "module",

		// 	parserOptions: {
		// 		project: "./tsconfig.lint.json",
		// 	},
		// },

		rules: {
			"@typescript-eslint/no-parameter-properties": "off",
			"@typescript-eslint/no-explicit-any": "off",

			"@typescript-eslint/no-use-before-define": [
				"error",
				{
					functions: false,
					typedefs: false,
					classes: false,
				},
			],

			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					ignoreRestSiblings: true,
					argsIgnorePattern: "^_",
				},
			],

			"@typescript-eslint/explicit-function-return-type": [
				"warn",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
				},
			],

			"@typescript-eslint/no-object-literal-type-assertion": "off",
			"@typescript-eslint/interface-name-prefix": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"no-var": "error",
			"prefer-const": "error",

			"prettier/prettier": [
				"error",
				{
					endOfLine: "auto",
				},
			],
		},
	},
	{
		files: ["**/*-test.ts"],
		rules: {
			"no-unused-expressions": "off",
			"@typescript-eslint/no-unused-expressions": "off",
		},
	},
]);

