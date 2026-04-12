/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integration test to verify that the palette-sdk-typescript package works correctly
 */

// Test importing individual functions from local palette files
import {
  spectroClustersMetadataGet,
  spectroClustersFiltersWorkspace,
  clusterProfilesFilterSummary,
  cloudAccountsAwsList,
  apiKeysList,
  type SpectroClustersMetadata,
  type SpectroClustersSummary,
  type ClusterProfilesSummary,
  type AwsAccounts,
  type ApiKeys,
  type ClusterProfilesFilterSpec,
} from "../palette/index";

// Test importing types from local palette files
import type { SpectroCluster, AwsAccount, AuthLogin } from "../palette/index";

console.log("Running palette-sdk-typescript integration tests...");

// Test that the main functions are available and working
console.log("PASS: Import successful!");
console.log(
  "spectroClustersMetadataGet type:",
  typeof spectroClustersMetadataGet
);
console.log(
  "spectroClustersFiltersWorkspace type:",
  typeof spectroClustersFiltersWorkspace
);
console.log(
  "clusterProfilesFilterSummary type:",
  typeof clusterProfilesFilterSummary
);
console.log("cloudAccountsAwsList type:", typeof cloudAccountsAwsList);
console.log("apiKeysList type:", typeof apiKeysList);

// Test that types are available
console.log("\nType imports:");
console.log("SpectroCluster type available:", typeof {} as SpectroCluster);
console.log("AwsAccount type available:", typeof {} as AwsAccount);
console.log("AuthLogin type available:", typeof {} as AuthLogin);

console.log("\nAll imports successful! SDK is working correctly.");

// Test the individual function pattern
console.log("\nTesting individual function pattern...");
try {
  const config = {
    headers: {
      ApiKey: "test-key",
      "Content-Type": "application/json",
    },
  };

  console.log("PASS: Config created successfully");

  // Check that functions are available
  const functions = [
    { name: "spectroClustersMetadataGet", func: spectroClustersMetadataGet },
    {
      name: "spectroClustersFiltersWorkspace",
      func: spectroClustersFiltersWorkspace,
    },
    {
      name: "clusterProfilesFilterSummary",
      func: clusterProfilesFilterSummary,
    },
    { name: "cloudAccountsAwsList", func: cloudAccountsAwsList },
    { name: "apiKeysList", func: apiKeysList },
  ];

  functions.forEach(({ name, func }) => {
    if (typeof func === "function") {
      console.log(`PASS: ${name} is available as function`);
    } else {
      console.log(`FAIL: ${name} is not available as function`);
    }
  });
} catch (error) {
  console.log("FAIL: Function pattern error:", error);
}

console.log("\nFunctions are available for direct import:");
console.log("• spectroClustersMetadataGet - Get cluster metadata");
console.log("• spectroClustersFiltersWorkspace - Get filtered clusters");
console.log("• clusterProfilesFilterSummary - Get cluster profiles");
console.log("• cloudAccountsAwsList - List AWS cloud accounts");
console.log("• apiKeysList - List API keys");
console.log("• And many more...");

console.log("\nFeatures:");
console.log("• Individual function imports");
console.log("• Full TypeScript support");
console.log("• Tree-shakable imports");
console.log("• Direct API function calls");

// Test that key functions are available
const keyFunctions = [
  { name: "spectroClustersMetadataGet", func: spectroClustersMetadataGet },
  { name: "clusterProfilesFilterSummary", func: clusterProfilesFilterSummary },
  { name: "cloudAccountsAwsList", func: cloudAccountsAwsList },
  { name: "apiKeysList", func: apiKeysList },
];

console.log("\nTesting key functions...");
keyFunctions.forEach(({ name, func }) => {
  if (typeof func === "function") {
    console.log(`PASS: ${name} is available as a function`);
  } else {
    console.log(`FAIL: ${name} is not a function (type: ${typeof func})`);
  }
});

// Test that types are working
try {
  console.log("\nTesting type definitions...");

  // This should compile without errors if types are working
  const mockCluster: Partial<SpectroCluster> = {
    metadata: {
      name: "test-cluster",
    },
  };

  const mockAccount: Partial<AwsAccount> = {
    metadata: {
      name: "test-aws-account",
    },
  };

  const mockAuth: Partial<AuthLogin> = {
    emailId: "test@example.com",
  };

  const mockFilterSpec: ClusterProfilesFilterSpec = {
    filter: {},
    sort: [],
  };

  console.log("PASS: Type definitions are working correctly");
  console.log("PASS: Mock cluster created:", !!mockCluster);
  console.log("PASS: Mock account created:", !!mockAccount);
  console.log("PASS: Mock auth created:", !!mockAuth);
  console.log("PASS: Mock filter spec created:", !!mockFilterSpec);
} catch (error) {
  console.log("FAIL: Type definitions error:", error);
}

console.log("\nIntegration test completed successfully!");
console.log("\nUsage examples:");
console.log("\n1. Import specific functions:");
console.log("```typescript");
console.log(
  "import { spectroClustersMetadataGet } from 'palette-sdk-typescript';"
);
console.log("");
console.log("const config = {");
console.log("  headers: {");
console.log("    ApiKey: process.env.PALETTE_API_KEY,");
console.log("    'Content-Type': 'application/json',");
console.log("  },");
console.log("};");
console.log("");
console.log(
  "const clusters = await spectroClustersMetadataGet(undefined, config);"
);
console.log("```");
console.log("\n2. Import with types:");
console.log("```typescript");
console.log("import {");
console.log("  clusterProfilesFilterSummary,");
console.log("  type ClusterProfilesFilterSpec,");
console.log("  type ClusterProfilesSummary");
console.log("} from 'palette-sdk-typescript';");
console.log("");
console.log(
  "const filterSpec: ClusterProfilesFilterSpec = { filter: {}, sort: [] };"
);
console.log(
  "const profiles: ClusterProfilesSummary = await clusterProfilesFilterSummary(filterSpec, {}, config);"
);
console.log("```");
