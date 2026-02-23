#!/usr/bin/env python3
# Copyright Spectro Cloud 2026, 0
# SPDX-License-Identifier: Apache-2.0

"""
OpenAPI Duplicate Schema Fixer

This script systematically identifies and fixes duplicate schema definitions
in OpenAPI specifications, particularly those with dotted vs non-dotted names.

Usage: python3 fix-duplicates.py <input-file> <output-file>
"""

import json
import sys
import re
from typing import Dict, List, Tuple, Any


def find_duplicate_schemas(definitions: Dict[str, Any]) -> List[Tuple[str, str]]:
    """Find schemas with dots that have corresponding versions without dots, and casing differences."""
    duplicates = []
    
    # Find dot-based duplicates
    for name in definitions.keys():
        if '.' in name:
            no_dot_name = name.replace('.', '')
            if no_dot_name in definitions:
                duplicates.append((name, no_dot_name))
    
    # Find casing-based duplicates
    schema_names = list(definitions.keys())
    for i, name1 in enumerate(schema_names):
        for j, name2 in enumerate(schema_names[i+1:], i+1):
            # Check if they're the same when case-insensitive
            if name1.lower() == name2.lower() and name1 != name2:
                # Skip if already found as dot-based duplicate
                if (name1, name2) not in duplicates and (name2, name1) not in duplicates:
                    # Prefer the version with consistent casing (camelCase starting with lowercase)
                    if name1[0].islower() and name2[0].isupper():
                        duplicates.append((name2, name1))  # Remove uppercase version, keep lowercase
                    elif name1[0].isupper() and name2[0].islower():
                        duplicates.append((name1, name2))  # Remove uppercase version, keep lowercase
                    else:
                        # Both have same case for first letter, prefer alphabetically first
                        if name1 < name2:
                            duplicates.append((name2, name1))
                        else:
                            duplicates.append((name1, name2))
    
    return duplicates


def count_references(spec: Dict[str, Any], schema_name: str) -> int:
    """Count how many times a schema is referenced throughout the spec."""
    ref_string = f"#/definitions/{schema_name}"
    spec_json = json.dumps(spec)
    return spec_json.count(ref_string)


def compare_schemas(schema1: Dict[str, Any], schema2: Dict[str, Any]) -> bool:
    """Compare two schemas to see if they're functionally equivalent."""
    # Remove description differences for comparison
    def normalize_schema(schema):
        if isinstance(schema, dict):
            normalized = {}
            for k, v in schema.items():
                if k != 'description':  # Ignore description differences
                    normalized[k] = normalize_schema(v)
            return normalized
        elif isinstance(schema, list):
            return [normalize_schema(item) for item in schema]
        else:
            return schema
    
    return normalize_schema(schema1) == normalize_schema(schema2)


def fix_schema_references(obj: Any, old_ref: str, new_ref: str) -> Any:
    """Recursively fix schema references throughout the spec."""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key == '$ref' and value == f"#/definitions/{old_ref}":
                result[key] = f"#/definitions/{new_ref}"
            else:
                result[key] = fix_schema_references(value, old_ref, new_ref)
        return result
    elif isinstance(obj, list):
        return [fix_schema_references(item, old_ref, new_ref) for item in obj]
    else:
        return obj


def choose_better_schema(dotted_schema: Dict[str, Any], 
                        no_dot_schema: Dict[str, Any], 
                        dotted_name: str, 
                        no_dot_name: str) -> Tuple[str, Dict[str, Any]]:
    """Choose which schema to keep based on completeness and quality."""
    
    # Count properties and descriptions
    def count_descriptions(schema):
        count = 0
        if isinstance(schema, dict):
            if 'description' in schema and schema['description'].strip():
                count += 1
            for value in schema.values():
                count += count_descriptions(value)
        elif isinstance(schema, list):
            for item in schema:
                count += count_descriptions(item)
        return count
    
    dotted_descriptions = count_descriptions(dotted_schema)
    no_dot_descriptions = count_descriptions(no_dot_schema)
    
    print(f"  {dotted_name}: {dotted_descriptions} descriptions")
    print(f"  {no_dot_name}: {no_dot_descriptions} descriptions")
    
    # Prefer the schema with more descriptions, or the non-dotted version if equal
    if no_dot_descriptions >= dotted_descriptions:
        return no_dot_name, no_dot_schema
    else:
        return dotted_name, dotted_schema


def fix_openapi_duplicates(input_file: str, output_file: str):
    """Main function to fix duplicate schemas in OpenAPI spec."""
    
    print(f"Loading OpenAPI spec from {input_file}...")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        spec = json.load(f)
    
    definitions = spec.get('definitions', {})
    
    print(f"Found {len(definitions)} total schema definitions")
    
    # Find duplicates
    duplicates = find_duplicate_schemas(definitions)
    
    if not duplicates:
        print("No duplicate schemas found!")
    else:
        print(f"Found {len(duplicates)} duplicate schema pairs:")
        
        for dotted_name, no_dot_name in duplicates:
            print(f"\nProcessing: {dotted_name} vs {no_dot_name}")
            
            # Count references to each version
            dotted_refs = count_references(spec, dotted_name)
            no_dot_refs = count_references(spec, no_dot_name)
            
            print(f"  {dotted_name}: {dotted_refs} references")
            print(f"  {no_dot_name}: {no_dot_refs} references")
            
            # Always keep the non-dotted version and remove the dotted version
            # Update all references to point to the non-dotted version
            spec = fix_schema_references(spec, dotted_name, no_dot_name)
            
            # Verify the dotted version exists before trying to delete it
            if dotted_name in spec['definitions']:
                del spec['definitions'][dotted_name]
                print(f"  Removed {dotted_name}, keeping {no_dot_name}")
                print(f"  Updated all references from {dotted_name} to {no_dot_name}")
            else:
                print(f"  Warning: {dotted_name} not found in definitions!")
    
    # Also fix any type arrays while we're at it
    print("\nFixing type arrays...")
    type_array_fixes = 0
    
    def fix_type_arrays(obj):
        nonlocal type_array_fixes
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                if key == 'type' and isinstance(value, list):
                    # Convert type arrays to string (taking first valid type)
                    if 'string' in value:
                        result[key] = 'string'
                    elif 'number' in value:
                        result[key] = 'number'
                    elif 'integer' in value:
                        result[key] = 'integer'
                    else:
                        result[key] = value[0]  # Take first type as fallback
                    type_array_fixes += 1
                    print(f"  Fixed type array: {value} -> {result[key]}")
                else:
                    result[key] = fix_type_arrays(value)
            return result
        elif isinstance(obj, list):
            return [fix_type_arrays(item) for item in obj]
        else:
            return obj
    
    spec = fix_type_arrays(spec)
    print(f"Fixed {type_array_fixes} type arrays")
    
    # Fix schema naming issues that cause orval import problems
    print("\nFixing schema naming issues...")
    naming_fixes = 0
    
    def fix_schema_naming(obj):
        nonlocal naming_fixes
        if isinstance(obj, dict):
            result = {}
            for key, value in obj.items():
                if key == '$ref' and isinstance(value, str) and value.startswith('#/definitions/'):
                    # Extract schema name from reference
                    schema_name = value.replace('#/definitions/', '')
                    
                    # Fix common naming issues that cause orval to generate wrong imports
                    fixed_name = schema_name
                    
                    # Fix APIEndpoint naming - ensure it stays as APIEndpoint not ApiEndpoint
                    if schema_name == 'v1APIEndpoint':
                        # Keep as is - this is correct
                        pass
                    elif 'APIEndpoint' in schema_name:
                        # Ensure API stays uppercase
                        fixed_name = schema_name.replace('ApiEndpoint', 'APIEndpoint')
                    
                    if fixed_name != schema_name:
                        result[key] = f"#/definitions/{fixed_name}"
                        naming_fixes += 1
                        print(f"  Fixed reference: {schema_name} -> {fixed_name}")
                    else:
                        result[key] = value
                else:
                    result[key] = fix_schema_naming(value)
            return result
        elif isinstance(obj, list):
            return [fix_schema_naming(item) for item in obj]
        else:
            return obj
    
    spec = fix_schema_naming(spec)
    print(f"Fixed {naming_fixes} schema naming issues")
    
    print(f"\nWriting fixed spec to {output_file}...")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)
    
    print("Done! The OpenAPI spec has been cleaned up.")
    print(f"Total schemas after cleanup: {len(spec.get('definitions', {}))}")
    
    # Verify the fix worked
    if duplicates:
        print("\nVerifying fixes...")
        final_duplicates = find_duplicate_schemas(spec.get('definitions', {}))
        if final_duplicates:
            print(f"WARNING: Still have {len(final_duplicates)} duplicates!")
            for d1, d2 in final_duplicates:
                print(f"  {d1} vs {d2}")
        else:
            print("✅ All duplicates successfully removed!")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 fix-duplicates.py <input-file> <output-file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        fix_openapi_duplicates(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1) 