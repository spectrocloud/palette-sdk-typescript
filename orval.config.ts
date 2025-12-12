/**
 * Copyright (c) Spectro Cloud
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from "orval";

export default defineConfig({
  palette: {
    input: {
      target: "./api/palette-apis-spec-tagged.json",
      override: {
        transformer: "./api/transformer.js",
      },
    },
    output: {
      target: "./palette/client.ts",
      client: "fetch",
      schemas: "./palette/schemas",
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: './client/index.ts',
          name: 'customFetch',
        },
        useTypeOverInterfaces: true,
      },
    },
  },
});
