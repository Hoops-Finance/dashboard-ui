import { FlatCompat } from "@eslint/eslintrc"; // [ADDED FOR NEXT DETECTION]
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

// 1) Create a minimal config object for Next plugin detection
const compat = new FlatCompat({
  baseDirectory: process.cwd(),
});
const nextLegacyConfig = compat.config({
  extends: ["plugin:@next/next/recommended"],
});

const myConfig = {
  name: "default-config",
  rules: {
    "standard/array-bracket-even-spacing": "off",
    "standard/computed-property-even-spacing": "off",
    "standard/object-curly-even-spacing": "off",
    "@typescript-eslint/block-spacing": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/comma-spacing": "off",
    "@typescript-eslint/func-call-spacing": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/key-spacing": "off",
    "@typescript-eslint/keyword-spacing": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/no-extra-parens": "off",
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/space-before-blocks": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/space-infix-ops": "off",
    "@typescript-eslint/type-annotation-spacing": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unnecessary-type-parameters": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/restrict-template-expressions": "off", // this has many warnings; fix it later
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-floating-promises": "warn"
  }
};

const allconfigs = tseslint.config(
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { project: true } } },
  eslintPluginPrettierRecommended,

  ...nextLegacyConfig,

  {
    files: ["./", "src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
  myConfig,
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

export default [...allconfigs];


/*
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const myConfig = {
  name: "default-config",
  rules: {
    "standard/array-bracket-even-spacing": "off",
    "standard/computed-property-even-spacing": "off",
    "standard/object-curly-even-spacing": "off",
    "@typescript-eslint/block-spacing": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/comma-spacing": "off",
    "@typescript-eslint/func-call-spacing": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/key-spacing": "off",
    "@typescript-eslint/keyword-spacing": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/no-extra-parens": "off",
    "@typescript-eslint/no-extra-semi": "off",
    "@typescript-eslint/object-curly-spacing": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/space-before-blocks": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/space-infix-ops": "off",
    "@typescript-eslint/type-annotation-spacing": "off",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-unnecessary-type-parameters": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/restrict-template-expressions": "off", // this has many warnings; fix it later
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-misused-promises": "warn",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-floating-promises": "warn"
  }
};

const allconfigs = tseslint.config(
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  { languageOptions: { parserOptions: { project: true } } },
  eslintPluginPrettierRecommended,
  {
  */
 
    // files: ["./", "src/**/*.ts", "src/**/*.tsx"],
 /*
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
  myConfig,
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
      "eslint.config.ts",
      "eslint.config.mjs",
      "combine.cjs",
      "utils\\combine.cjs",
      "*.js"
    ]
  }
);

export default [...allconfigs];
*/