import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

import eslintConfigPrettier from 'eslint-config-prettier';
import rustykittyConfig from '@rustykitty/eslint-config';

export default [
    ...rustykittyConfig,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            tsPlugin,
        },
    },
    eslintConfigPrettier,
    {
        ignores: ['node_modules', 'dist', '.wrangler', '.yarn'],
    }
];
