/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simple test script to retrieve cluster profiles from Palette API
 */

import dotenvx from "@dotenvx/dotenvx";
import {
  clusterProfilesFilterSummary,
  type ClusterProfilesFilterSpec,
  type ClusterProfilesFilterSummaryParams,
  type ClusterProfilesSummary,
} from "../palette";

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
  console.log("Testing cluster profiles function availability...");

  // Test that the function is available
  if (typeof clusterProfilesFilterSummary === "function") {
    console.log("PASS: clusterProfilesFilterSummary is available");
  } else {
    console.error("FAIL: clusterProfilesFilterSummary is not available");
    process.exit(1);
  }

  console.log("Retrieving cluster profiles from Palette API...");

  try {
    // Create configuration object
    const config = {
      headers: {
        ApiKey: API_KEY,
        "Content-Type": "application/json",
      },
    };

    // Define the filter spec with proper typing
    const filterSpec: ClusterProfilesFilterSpec = {
      filter: {},
      sort: [],
    };

    // Define query parameters with proper typing
    const queryParams: ClusterProfilesFilterSummaryParams = {};

    // Call the API using individual function import with full type safety
    const response: ClusterProfilesSummary = await clusterProfilesFilterSummary(
      filterSpec,
      queryParams,
      config
    );

    if (response && response.items && Array.isArray(response.items)) {
      console.log(`Found ${response.items.length} cluster profiles`);

      // Display the cluster profiles
      response.items.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.metadata?.name || "Unknown"}`);
        console.log(`   UID: ${profile.metadata?.uid || "Unknown"}`);
        console.log(`   Version: ${profile.specSummary?.version || "N/A"}`);
        console.log(
          `   Created: ${profile.metadata?.creationTimestamp || "Unknown"}`
        );
      });

      console.log("PASS: Cluster profiles test completed successfully");
      return true;
    } else {
      console.error("FAIL: Unexpected response format:", response);
      return false;
    }
  } catch (error) {
    console.error("FAIL: Error retrieving cluster profiles:", error);
    return false;
  }
}

// Run the test
testClusterProfiles()
  .then((success) => {
    if (success) {
      console.log("Test completed successfully");
      process.exit(0);
    } else {
      console.log("Test failed");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
