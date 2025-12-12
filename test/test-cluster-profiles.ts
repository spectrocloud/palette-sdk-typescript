/**
 * Copyright (c) Spectro Cloud
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test to verify cluster profile functions using individual function imports
 */

import dotenvx from "@dotenvx/dotenvx";
import {
  clusterProfilesFilterSummary,
  clusterProfilesMetadata,
  type ClusterProfilesFilterSpec,
  type ClusterProfilesFilterSummaryParams,
  type ClusterProfilesSummary,
  type ClusterProfilesMetadata,
} from "../dist/palette";

// Load environment variables with expanded path handling
const result = dotenvx.config({
  ignore: ["MISSING_ENV_FILE"],
  path: ["../.env", ".env"],
});

// Log environment loading results
if (result.error) {
  console.error(
    "dotenvx encountered an error loading environment variables: ",
    result.error.message
  );
} else {
  console.log(
    `Loaded ${Object.keys(result.parsed || {}).length} environment variables`
  );
}

// Environment variables
const API_KEY = process.env.PALETTE_API_KEY;
const BASE_URL = process.env.PALETTE_BASE_URL || "https://api.spectrocloud.com";

if (!API_KEY) {
  console.error("PALETTE_API_KEY environment variable is required");
  process.exit(1);
}

async function testClusterProfiles() {
  console.log("Running Cluster Profiles Tests");
  console.log("Starting cluster profiles test...");

  try {
    // Create configuration object
    const config = {
      headers: {
        ApiKey: API_KEY,
        "Content-Type": "application/json",
      },
    };

    console.log("PASS: Config created successfully");

    // Test that cluster profile functions are available
    const functions = [
      {
        name: "clusterProfilesFilterSummary",
        func: clusterProfilesFilterSummary,
      },
      { name: "clusterProfilesMetadata", func: clusterProfilesMetadata },
    ];

    for (const { name, func } of functions) {
      if (typeof func === "function") {
        console.log(`PASS: ${name} is available as function`);
      } else {
        throw new Error(`${name} is not available as function`);
      }
    }

    // Test a simple API call to verify the functions work
    console.log("Testing API call...");

    const metadataResponse: ClusterProfilesMetadata =
      await clusterProfilesMetadata(config);
    if (metadataResponse && Object.keys(metadataResponse).length > 0) {
      console.log("PASS: clusterProfilesMetadata call successful");
      console.log(
        `Response contains: ${Object.keys(metadataResponse).join(", ")}`
      );
    } else {
      throw new Error("clusterProfilesMetadata call failed");
    }

    // Test cluster profiles filter summary
    console.log("Testing cluster profiles filter summary...");
    const filterSpec: ClusterProfilesFilterSpec = {
      filter: {},
      sort: [],
    };

    const summaryResponse: ClusterProfilesSummary =
      await clusterProfilesFilterSummary(filterSpec, {}, config);

    if (
      summaryResponse &&
      summaryResponse.items &&
      Array.isArray(summaryResponse.items)
    ) {
      console.log(
        `PASS: Found ${summaryResponse.items.length} cluster profiles`
      );

      // Display first few cluster profiles
      summaryResponse.items.slice(0, 3).forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.metadata?.name || "Unknown"}`);
        console.log(`     UID: ${profile.metadata?.uid || "Unknown"}`);
        console.log(`     Version: ${profile.specSummary?.version || "N/A"}`);
      });
    } else {
      throw new Error("clusterProfilesFilterSummary call failed");
    }

    console.log("Cluster profiles test completed successfully!");
    return true;
  } catch (error) {
    console.error("FAIL: Test failed:", error);
    throw error;
  }
}

if (require.main === module) {
  testClusterProfiles()
    .then(() => {
      console.log("All cluster profile tests passed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Cluster profile tests failed:", error);
      process.exit(1);
    });
}

export { testClusterProfiles };
