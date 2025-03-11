
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { FlatCompat } from '@eslint/eslintrc'

const allconfigs = tseslint.config(
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    eslintPluginPrettierRecommended,
    { languageOptions: { parserOptions: { project: true } } },   
    {
      ignores: [
        ".history",
        ".vscode",
        "node_modules",
        "dist",
        "build",
        "tests",
        ".next",
        "out",
        "usboverride.js",
        "postcss.config.mjs",
        "next.config.mjs",
        //"eslint.config.ts",
        "eslint.config.mjs",
        "combine.cjs",
        "utils\\combine.cjs",
        "*.js"
      ]
    }
  );

function configs() {
  try{
    const allconfigs = tseslint.config(
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      eslintPluginPrettierRecommended,
      { languageOptions: { parserOptions: { project: true } } },   
      {
        ignores: [
          ".history",
          ".vscode",
          "node_modules",
          "dist",
          "build",
          "tests",
          ".next",
          "out",
          "usboverride.js",
          "postcss.config.mjs",
          "next.config.mjs",
          //"eslint.config.ts",
          "eslint.config.mjs",
          "combine.cjs",
          "utils\\combine.cjs",
          "*.js"
        ]
      }
    );
    return allconfigs;

  }
  catch(e){
    console.log(e);
  }
}
const compat = new FlatCompat({
    // import.meta.dirname is available after Node.js v20.11.0
    baseDirectory: import.meta.dirname,
    recommendedConfig: tseslint.configs.recommendedTypeChecked
})
  const eslintConfig = [
    ...compat.config({
      extends: ['next', 'prettier'],
    })
  ]

export default [...eslintConfig];
