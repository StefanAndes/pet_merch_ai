module.exports = {
  root: true,
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
      },
    },
    {
      files: ["apps/web/**/*.ts", "apps/web/**/*.tsx"],
      extends: ["next/core-web-vitals"],
    },
  ],
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    "out/",
    ".turbo/",
    "coverage/",
  ],
} 