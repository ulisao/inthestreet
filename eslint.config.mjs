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
    // Codegen de Convex: el CLI reescribe estos archivos (con su propio
    // /* eslint-disable */ arriba) cada vez que corre `convex dev`. Lintearlos
    // deja un warning permanente que nadie puede arreglar.
    "convex/_generated/**",
  ]),
]);

export default eslintConfig;
