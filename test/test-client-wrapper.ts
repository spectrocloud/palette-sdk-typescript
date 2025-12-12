/**
 * Copyright (c) Spectro Cloud
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  clusterProfilesFilterSummary,
  clusterProfilesMetadata,
  type ClusterProfilesFilterSpec,
  type ClusterProfilesFilterSummaryParams,
  type ClusterProfilesSummary,
  type ClusterProfilesMetadata,
} from "../dist/palette";
import dotenvx from "@dotenvx/dotenvx";

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

const API_KEY = process.env.PALETTE_API_KEY;
const BASE_URL = process.env.PALETTE_BASE_URL || "https://api.spectrocloud.com";

if (!API_KEY) {
  console.error("PALETTE_API_KEY environment variable is required");
  process.exit(1);
}

async function testClientWrapper() {
  console.log("Testing individual function imports pattern...");

  try {
    // Test the individual function pattern
    const config = {
      headers: {
        ApiKey: API_KEY,
        "Content-Type": "application/json",
      },
    };

    console.log("PASS: Config created successfully");

    // Test that the functions are available
    console.log("Testing function availability...");

    // Check if functions are available
    if (typeof clusterProfilesFilterSummary === "function") {
      console.log("PASS: clusterProfilesFilterSummary is available");
    } else {
      console.log("FAIL: clusterProfilesFilterSummary is not available");
      return false;
    }

    if (typeof clusterProfilesMetadata === "function") {
      console.log("PASS: clusterProfilesMetadata is available");
    } else {
      console.log("FAIL: clusterProfilesMetadata is not available");
      return false;
    }

    // Test making an API call
    console.log("Testing API call...");
    const filterSpec: ClusterProfilesFilterSpec = {
      filter: {},
      sort: [],
    };

    const response: ClusterProfilesSummary = await clusterProfilesFilterSummary(
      filterSpec,
      {},
      config
    );

    if (response && response.items && Array.isArray(response.items)) {
      console.log(
        `PASS: API call successful! Found ${response.items.length} cluster profiles`
      );
    } else {
      console.log("FAIL: API call failed or returned unexpected data");
      return false;
    }

    // Test another function to ensure multiple functions work
    console.log("Testing another function...");

    const metadataResponse: ClusterProfilesMetadata =
      await clusterProfilesMetadata(config);
    if (metadataResponse && Object.keys(metadataResponse).length > 0) {
      console.log("PASS: clusterProfilesMetadata call successful");
    } else {
      console.log("FAIL: clusterProfilesMetadata call failed");
      return false;
    }

    console.log("All function import tests passed!");
    return true;
  } catch (error) {
    console.error("FAIL: Error testing function imports:", error);
    return false;
  }
}

export { testClientWrapper };

// Run the test if this file is executed directly
if (require.main === module) {
  testClientWrapper()
    .then((success) => {
      if (success) {
        console.log("Function imports test completed successfully");
        process.exit(0);
      } else {
        console.log("Function imports test failed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}
