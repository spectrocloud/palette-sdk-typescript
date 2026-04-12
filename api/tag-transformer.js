/**
 * Copyright Spectro Cloud 2026, 0
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * OpenAPI transformer to add meaningful tags based on endpoint paths
 * This enables tags-split mode to organize generated code into logical folders
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} - The camelCase string
 */
function toCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Extract meaningful tag from endpoint path
 * @param {string} path - The endpoint path
 * @returns {string} - The extracted tag
 */
function extractTagFromPath(path) {
  // Remove /v1/ prefix and split by /
  const segments = path.replace(/^\/v1\//, '').split('/');
  const firstSegment = segments[0];
  
  // Handle special cases that don't follow the standard camelCase pattern
  const specialCases = {
    'spectroclusters': 'spectroclusters'
  };
  
  if (specialCases[firstSegment]) {
    return specialCases[firstSegment];
  }
  
  // Convert to camelCase for all other cases
  return toCamelCase(firstSegment);
}

/**
 * Transform OpenAPI spec to add meaningful tags
 * @param {Object} spec - The OpenAPI specification
 * @returns {Object} - The transformed specification
 */
function transformSpec(spec) {
  if (!spec.paths) {
    console.log('⚠️  No paths found in OpenAPI spec');
    return spec;
  }

  let transformedEndpoints = 0;
  
  // Iterate through all paths and operations
  for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (typeof operation === 'object' && operation !== null) {
        const meaningfulTag = extractTagFromPath(pathKey);
        
        // Replace existing tags with meaningful tag
        operation.tags = [meaningfulTag];
        transformedEndpoints++;
      }
    }
  }

  console.log(`✅ Added meaningful tags to ${transformedEndpoints} endpoints`);
  return spec;
}

/**
 * Main execution when called directly
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node tag-transformer.js <input-file> <output-file>');
    process.exit(1);
  }

  const [inputFile, outputFile] = args;
  
  try {
    console.log('🏷️  Adding meaningful tags to OpenAPI spec...');
    
    // Read input file
    const inputData = fs.readFileSync(inputFile, 'utf8');
    const spec = JSON.parse(inputData);
    
    // Transform the spec
    const transformedSpec = transformSpec(spec);
    
    // Write output file
    fs.writeFileSync(outputFile, JSON.stringify(transformedSpec, null, 2));
    
    console.log(`📝 Transformed spec written to ${outputFile}`);
  } catch (error) {
    console.error('❌ Error transforming OpenAPI spec:', error.message);
    process.exit(1);
  }
}

module.exports = { transformSpec, extractTagFromPath }; 