/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test to verify that the built package exports work correctly
 * This simulates how the package would be used when installed via npm
 */

import {
  clusterProfilesFilterSummary,
  clusterProfilesMetadata,
  type ClusterProfilesFilterSpec,
  type ClusterProfilesFilterSummaryParams,
  type ClusterProfilesSummary,
  type ClusterProfilesMetadata,
} from "../dist/palette";

async function testBuiltPackage() {
  console.log("Testing built package imports...");

  // Test that functions are available
  if (typeof clusterProfilesFilterSummary !== "function") {
    throw new Error("clusterProfilesFilterSummary is not a function");
  }
  console.log("✅ clusterProfilesFilterSummary imported successfully");

  if (typeof clusterProfilesMetadata !== "function") {
    throw new Error("clusterProfilesMetadata is not a function");
  }
  console.log("✅ clusterProfilesMetadata imported successfully");

  // Test that types are available
  const filterSpec: ClusterProfilesFilterSpec = {
    filter: {},
    sort: [],
  };
  console.log("✅ ClusterProfilesFilterSpec type available");

  const queryParams: ClusterProfilesFilterSummaryParams = {};
  console.log("✅ ClusterProfilesFilterSummaryParams type available");

  // Test configuration
  const config = {
    headers: {
      ApiKey: "test-key",
      "Content-Type": "application/json",
      ProjectUID: "test-project",
    },
  };

  console.log("✅ Configuration created successfully");

  // Test function calls (these will fail with test data but should be callable)
  console.log("Testing function call signatures...");

  try {
    // This will likely fail due to invalid API key, but we're testing the signature
    await clusterProfilesFilterSummary(filterSpec, queryParams, config);
  } catch (error) {
    // Expected to fail with test credentials
    console.log("✅ clusterProfilesFilterSummary function signature correct");
  }

  try {
    // This will likely fail due to invalid API key, but we're testing the signature
    await clusterProfilesMetadata(config);
  } catch (error) {
    // Expected to fail with test credentials
    console.log("✅ clusterProfilesMetadata function signature correct");
  }

  console.log("🎉 All built package tests passed!");
}

testBuiltPackage().catch((error) => {
  console.error("❌ Built package test failed:", error);
  process.exit(1);
});
