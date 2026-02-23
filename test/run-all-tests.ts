/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Simple test runner that executes all test files
 */

import { execSync } from "child_process";
import * as path from "path";

const testFiles = [
  "test-imports.ts",
  "test-cluster-profiles.ts",
  "test-client-wrapper.ts",
  "cluster-profiles-simple.ts",
  "test-built-package.ts",
];

console.log("Running palette-sdk-typescript integration tests...");

let allPassed = true;

for (const testFile of testFiles) {
  console.log(`\nRunning ${testFile}...`);

  try {
    const testPath = path.join(__dirname, testFile);
    execSync(
      `npx ts-node --transpile-only --project test/tsconfig.json ${testPath}`,
      {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      }
    );
    console.log(`PASS: ${testFile}`);
  } catch (error) {
    console.error(`FAIL: ${testFile}`);
    allPassed = false;
  }
}

// Run package usage test
console.log(`\nRunning package import usage test...`);
try {
  const testPackageUsageDir = path.join(__dirname, "test-package-usage");

  console.log("Installing dependencies in test-package-usage...");
  execSync("npm install", {
    stdio: "inherit",
    cwd: testPackageUsageDir,
  });

  console.log("Running test in test-package-usage...");
  execSync("npm run test", {
    stdio: "inherit",
    cwd: testPackageUsageDir,
  });

  console.log("PASS: package usage test");
} catch (error) {
  console.error("FAIL: package usage test");
  allPassed = false;
}

console.log("\n" + "=".repeat(50));
if (allPassed) {
  console.log("All tests passed!");
  process.exit(0);
} else {
  console.log("Some tests failed");
  process.exit(1);
}
