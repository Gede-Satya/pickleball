import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/generated/**",
    // Folder skill pihak ketiga & aset yang bukan bagian kode aplikasi.
    "ui-ux-pro-max-skill/**",
    // Skrip helper root (CommonJS / k6) — bukan bagian bundle aplikasi.
    "clean-next.js",
    "load-test.js",
    "load-test-smoke.js",
  ]),
  {
    // Skrip helper (Node.js / CommonJS) diizinkan memakai require().
    files: ["scripts/**/*.js", "scripts/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
