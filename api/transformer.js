/**
 * Recursively removes all additionalProperties fields of type object from the OpenAPI spec
 * @param {Object} obj - The object to clean
 * @param {string} path - Current path for debugging (optional)
 * @returns {number} - Number of additionalProperties removed
 */
function removeAdditionalPropertiesOfTypeObject(obj, path = '') {
  let removedCount = 0;
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'additionalProperties' && typeof value === 'object' && value !== null) {
        // If the value is a schema object (not boolean), remove it
        delete obj[key];
        removedCount++;
        console.log(`    🗑️  Removed additionalProperties of type object at ${path}`);
      } else if (typeof value === 'object' && value !== null) {
        removedCount += removeAdditionalPropertiesOfTypeObject(value, `${path}.${key}`);
      }
    }
  }
  return removedCount;
}
/**
 * Copyright (c) Spectro Cloud
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Removes duplicate urlEncodedBase64 schema and replaces its references with string type
 * @param {Object} spec - The OpenAPI specification object
 * @returns {number} - Number of changes made
 */
function removeDuplicateUrlEncodedBase64Schema(spec) {
  let changes = 0;
  
  // Remove the schema definition
  if (spec.components && spec.components.schemas && spec.components.schemas.urlEncodedBase64) {
    console.log('🔧 Removing duplicate urlEncodedBase64 schema from OpenAPI spec');
    delete spec.components.schemas.urlEncodedBase64;
    changes++;
  }
  
  // Replace all references to urlEncodedBase64 with inline string type
  changes += replaceUrlEncodedBase64References(spec);
  
  return changes;
}

/**
 * Recursively replaces $ref references to urlEncodedBase64 with inline string type
 * @param {Object} obj - The object to clean references in
 * @param {string} path - Current path for debugging (optional)
 * @returns {number} - Number of references replaced
 */
function replaceUrlEncodedBase64References(obj, path = '') {
  let changesCount = 0;
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        // Replace urlEncodedBase64 references with inline string type
        if (value === '#/components/schemas/urlEncodedBase64' || value === '#/definitions/urlEncodedBase64') {
          // Replace the $ref with an inline string type
          delete obj[key];
          obj.type = 'string';
          obj.format = 'byte';
          changesCount++;
          console.log(`    ✅ Replaced urlEncodedBase64 reference with string type at ${path}`);
        }
      } else if (typeof value === 'object') {
        changesCount += replaceUrlEncodedBase64References(value, `${path}.${key}`);
      }
    }
  }
  
  return changesCount;
}

/**
 * Cleans v1/V1 prefixes from schema names
 * @param {Object} spec - The OpenAPI specification object
 * @returns {number} - Number of schemas renamed
 */
function cleanSchemaNamesFromV1Prefixes(spec) {
  if (!spec.components || !spec.components.schemas) {
    return 0;
  }

  const cleanedSchemas = {};
  let renamedSchemas = 0;
  
  for (const [schemaName, schemaValue] of Object.entries(spec.components.schemas)) {
    let cleanName = schemaName;
    
    // Remove v1 or V1 prefix from schema names and ensure PascalCase
    if (schemaName.match(/^[vV]1[A-Z]/)) {
      // Remove v1/V1 prefix and ensure first character is uppercase (PascalCase)
      cleanName = schemaName.replace(/^[vV]1([A-Z])/, (match, firstChar) => firstChar.toUpperCase());
      renamedSchemas++;
    }
    
    cleanedSchemas[cleanName] = schemaValue;
  }
  
  if (renamedSchemas > 0) {
    console.log(`  ✅ Cleaned ${renamedSchemas} schema names (removed v1/V1 prefixes, ensured PascalCase)`);
    spec.components.schemas = cleanedSchemas;
  }
  
  return renamedSchemas;
}

/**
 * Cleans operation IDs to remove v1 prefixes
 * @param {Object} spec - The OpenAPI specification object
 * @returns {number} - Number of operation IDs cleaned
 */
function cleanOperationIdsFromV1Prefixes(spec) {
  if (!spec.paths) {
    return 0;
  }

  let cleanedOperations = 0;
  
  for (const [pathName, pathValue] of Object.entries(spec.paths)) {
    if (typeof pathValue === 'object' && pathValue !== null) {
      for (const [method, operation] of Object.entries(pathValue)) {
        if (operation && operation.operationId && operation.operationId.match(/^v1[A-Z]/)) {
          // Remove v1 prefix and ensure first character is uppercase (PascalCase)
          const cleanOperationId = operation.operationId.replace(/^v1([A-Z])/, (match, firstChar) => firstChar.toUpperCase());
          operation.operationId = cleanOperationId;
          cleanedOperations++;
        }
      }
    }
  }
  
  if (cleanedOperations > 0) {
    console.log(`  ✅ Cleaned ${cleanedOperations} operation IDs (removed v1 prefixes, ensured PascalCase)`);
  }
  
  return cleanedOperations;
}

/**
 * Recursively cleans $ref references to use updated schema names
 * @param {Object} obj - The object to clean references in
 * @param {string} path - Current path for debugging (optional)
 * @returns {number} - Number of references cleaned
 */
function cleanReferences(obj, path = '') {
  let changesCount = 0;
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string') {
        // Clean schema references - remove v1/V1 prefix and ensure PascalCase
        const cleanRef = value.replace(/#\/components\/schemas\/[vV]1([A-Z][a-zA-Z0-9]*)/, (match, schemaName) => {
          return `#/components/schemas/${schemaName.charAt(0).toUpperCase()}${schemaName.slice(1)}`;
        });
        if (cleanRef !== value) {
          obj[key] = cleanRef;
          changesCount++;
        }
      } else if (typeof value === 'object') {
        changesCount += cleanReferences(value, `${path}.${key}`);
      }
    }
  }
  
  return changesCount;
}

/**
 * Comprehensive OpenAPI transformer to clean up the specification before code generation
 * This prevents Orval from generating problematic code that would require post-processing
 * @param {Object} spec - The OpenAPI specification object
 * @returns {Object} - The modified OpenAPI specification
 */
function cleanOpenAPISpec(spec) {
  console.log('🔧 Cleaning OpenAPI specification...');
  
  let changesCount = 0;

  // 1. Remove duplicate urlEncodedBase64 schema
  changesCount += removeDuplicateUrlEncodedBase64Schema(spec);

  // 2. Clean v1/V1 prefixes from schema names
  changesCount += cleanSchemaNamesFromV1Prefixes(spec);

  // 3. Clean operation IDs to remove v1 prefixes
  changesCount += cleanOperationIdsFromV1Prefixes(spec);

  // 4. Clean $ref references to use updated schema names
  changesCount += cleanReferences(spec);

  // 5. Remove all additionalProperties of type object
  const removedAdditionalProps = removeAdditionalPropertiesOfTypeObject(spec);
  if (removedAdditionalProps > 0) {
    console.log(`  ✅ Removed ${removedAdditionalProps} additionalProperties of type object`);
  }
  changesCount += removedAdditionalProps;

  if (changesCount > 0) {
    console.log(`🎯 OpenAPI spec cleaned: ${changesCount} total changes applied`);
  } else {
    console.log('✅ OpenAPI spec was already clean');
  }
  
  return spec;
}

module.exports = cleanOpenAPISpec; 