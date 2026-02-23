#!/usr/bin/env node
/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Post-processing script to fix duplicate exports in generated TypeScript code
 * This script removes duplicate exports that differ only in casing, which cause
 * TypeScript compilation errors on case-sensitive file systems.
 * 
 * Updated to handle tags-split mode where code is organized by functional areas.
 */

const fs = require("fs");
const path = require("path");

const PALETTE_DIR = path.join(__dirname, "../palette");
const PALETTE_SCHEMAS_INDEX = path.join(PALETTE_DIR, "schemas/index.ts");

console.log("🔧 Post-processing generated code to fix duplicate exports...\n");

/**
 * Fix syntax errors and import casing issues in all schema files
 */
function fixSchemaFiles() {
  const schemasDir = path.join(__dirname, "../palette/schemas");

  if (!fs.existsSync(schemasDir)) {
    console.log("⚠️  Palette schemas directory not found");
    return true;
  }

  let fixedFiles = 0;

  // Get all TypeScript files in the schemas directory
  const files = fs
    .readdirSync(schemasDir)
    .filter((file) => file.endsWith(".ts") && file !== "index.ts");

  files.forEach((filename) => {
    const filePath = path.join(schemasDir, filename);
    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;

    // Fix common syntax errors
    // 1. Remove extra closing braces at the end of files
    content = content.replace(/;\s*\n\s*}\s*$/, ";\n");

    // 2. Fix import casing issues (e.g., v1VmInterfaceSriov -> v1VmInterfaceSRIOV)
    content = content.replace(/v1VmInterfaceSriov/g, "v1VmInterfaceSRIOV");

    // 3. Remove any trailing empty lines or malformed syntax
    content = content.replace(/\n\s*\n\s*}\s*$/, "\n");

    // 4. Fix incomplete interfaces - add missing closing brace if needed
    if (
      content.includes("export interface ") &&
      !content.trim().endsWith("}")
    ) {
      // Check if the interface declaration is incomplete
      const lines = content.split("\n");
      const lastNonEmptyLine = lines.filter((line) => line.trim()).pop();

      if (lastNonEmptyLine && !lastNonEmptyLine.trim().endsWith("}")) {
        content = content.trim() + "\n}\n";
      }
    }

    // Fix UrlEncodedBase64 imports - this is a simple string type that doesn't generate a separate file
    // Remove the import statement
    content = content.replace(/import\s+type\s*{\s*UrlEncodedBase64\s*}\s+from\s+[\"']\.\/urlEncodedBase64[\"'];\s*\n/g, '');
    
    // Replace UrlEncodedBase64 type usage with string
    content = content.replace(/:\s*UrlEncodedBase64(\s*[;,}|\]])/g, ': string$1');
    content = content.replace(/\?\s*:\s*UrlEncodedBase64(\s*[;,}|\]])/g, '?: string$1');
    content = content.replace(/:\s*UrlEncodedBase64\[\]/g, ': string[]');
    content = content.replace(/\?\s*:\s*UrlEncodedBase64\[\]/g, '?: string[]');
    content = content.replace(/Array<UrlEncodedBase64>/g, 'Array<string>');
    content = content.replace(/=\s*UrlEncodedBase64(\s*[;,}|\]])/g, '= string$1');

    // APIEndpoint is correctly exported as APIEndpoint from aPIEndpoint.ts - no changes needed

    // Fix index signature compatibility with optional properties
    // Fix the specific pattern that causes TS2411 errors
    content = content.replace(
      /\[key: string\]: \{ \[key: string\]: unknown \};/g,
      '[key: string]: unknown;'
    );

    // Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      fixedFiles++;
    }
  });

  if (fixedFiles > 0) {
    console.log(`✅ Fixed syntax errors in ${fixedFiles} schema files`);
  } else {
    console.log("✅ No syntax errors found in schema files");
  }

  return true;
}

/**
 * Add license headers to all generated files using make license
 */
function addLicenseHeaders() {
  const { execSync } = require('child_process');
  
  try {
    console.log("📄 Adding license headers to generated files...");
    
    // Run make license
    execSync('make license', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log("✅ License headers added successfully");
    return true;
  } catch (error) {
    console.error("❌ License header addition failed:", error.message);
    return false;
  }
}

/**
 * Run ESLint on generated files to catch type errors and fix issues
 */
function runEslint() {
  const { execSync } = require('child_process');
  
  try {
    console.log("🔍 Running ESLint on generated files...");
    
    // Run ESLint with --fix to automatically fix issues
    execSync('npm run lint', { 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    console.log("✅ ESLint completed successfully");
    return true;
  } catch (error) {
    console.error("❌ ESLint found issues:", error.message);
    console.error("⚠️  Please review the ESLint output above for type errors in generated files");
    
    return false;
  }
}


/**
 * Add runtime base URL configuration to the client
 */
function addRuntimeBaseUrlConfig() {
  const clientPath = path.join(__dirname, "../palette/client.ts");
  
  if (!fs.existsSync(clientPath)) {
    console.log("⚠️  client.ts not found");
    return false;
  }

  let content = fs.readFileSync(clientPath, "utf8");
  
  // Check if already processed
  if (content.includes("setPaletteBaseUrl")) {
    console.log("✅ Runtime base URL configuration already exists");
    return true;
  }

  // Add configuration section at the top of the file (after imports)
  const configSection = `
// Runtime configuration for base URL
let PALETTE_BASE_URL = "https://api.spectrocloud.com";

/**
 * Configure the base URL for all Palette API calls
 * @param baseUrl - The base URL for your Palette instance (e.g., "https://your-palette-host.com")
 */
export const setPaletteBaseUrl = (baseUrl: string) => {
  PALETTE_BASE_URL = baseUrl.replace(/\\/$/, ''); // Remove trailing slash
};

/**
 * Get the current configured base URL
 */
export const getPaletteBaseUrl = () => PALETTE_BASE_URL;

`;

  // Find the end of imports section
  const importRegex = /(import[\s\S]*?from ['"][^'"]+['"];?\s*)+/;
  const match = content.match(importRegex);

  if (match) {
    content = content.replace(match[0], match[0] + configSection);
  } else {
    // If no imports found, add at the beginning after the header comment
    const headerRegex = /(\/\*\*[\s\S]*?\*\/\s*)/;
    const headerMatch = content.match(headerRegex);
    if (headerMatch) {
      content = content.replace(headerMatch[0], headerMatch[0] + configSection);
    } else {
      content = configSection + content;
    }
  }

  // Replace hardcoded URLs with the variable
  content = content.replace(
    /return `https:\/\/api\.spectrocloud\.com/g,
    'return `${PALETTE_BASE_URL}'
  );

  // Also handle any other URL patterns that might exist
  content = content.replace(
    /`https:\/\/api\.spectrocloud\.com/g,
    '`${PALETTE_BASE_URL}'
  );

  fs.writeFileSync(clientPath, content, "utf8");
  console.log("✅ Added runtime base URL configuration to client");
  
  return true;
}

/**
 * Create main index file with exports from client and schemas
 */
function createMainIndexFile() {
  const paletteDir = path.join(__dirname, "../palette");
  const mainIndexPath = path.join(paletteDir, "index.ts");
  
  if (!fs.existsSync(paletteDir)) {
    console.log("⚠️  Palette directory not found");
    return false;
  }

  // Check if client.ts exists
  const clientPath = path.join(paletteDir, "client.ts");
  const schemasPath = path.join(paletteDir, "schemas");
  
  if (!fs.existsSync(clientPath)) {
    console.log("⚠️  client.ts not found");
    return false;
  }

  if (!fs.existsSync(schemasPath)) {
    console.log("⚠️  schemas directory not found");
    return false;
  }

  const content = `/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

// Export all API client functions
export * from "./client";

// Export all schemas/types
export * from "./schemas";
`;

  fs.writeFileSync(mainIndexPath, content, "utf8");
  console.log("✅ Created main index file with exports from client and schemas");
  
  return true;
}



/**
 * Main execution
 */
function main() {
  try {
    const success1 = fixSchemaFiles();
    const success2 = addRuntimeBaseUrlConfig();
    const success3 = createMainIndexFile();
    const success4 = addLicenseHeaders();
    const success5 = runEslint();

    if (success1 && success2 && success3 && success4 && success5) {

      console.log("\n🎉 Post-processing completed successfully!");
      console.log("Runtime base URL configuration has been added.");
      console.log("License headers have been added to all files.");
      console.log("ESLint has validated all generated files for type errors.");
    } else {
      console.log("\n❌ Post-processing completed with some issues");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Post-processing failed:", error);
    process.exit(1);
  }
}

main();
