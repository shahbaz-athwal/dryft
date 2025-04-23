import { config } from '@repo/eslint-config/server';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...config,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
      },
    },
  }
); 