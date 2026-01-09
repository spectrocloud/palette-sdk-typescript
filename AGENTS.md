# Overview

This is a repository that contains the TypeScript SDK for the Palette API. You can use this SDK to interact with the Palette API in your TypeScript projects.

## Repository Structure

- `palette/`: Contains the generated TypeScript SDK code organized by API tags.
- `client/`: Contains the custom HTTP client implementation.
- `api/`: Contains scripts for OpenAPI spec processing and code generation.
- `openapi/`: Contains the generated OpenAPI YAML specification.
- `test/`: Contains integration tests for the SDK.

## Development

- Use `make help` to see available Makefile targets.
- Run `make generate` to regenerate the SDK from the OpenAPI spec.
- Run `npm test` to execute integration tests.
- Run `npm run build` to compile TypeScript to JavaScript.

## General Guidelines

- Comments should be complete sentences and end with a period.
- Review `package.json` to understand dependencies and their versions.
- Use the bulwark_scan_project tool to scan for compromised packages before installing dependencies.
- DO NOT UPDATE THE `package-lock.json` file manually. It is automatically updated by npm.
- DO NOT UPDATE DEPENDENCIES UNLESS EXPLICITLY REQUESTED.
- DO NOT CREATE MANUAL GIT TAGS. They are automatically created by CI/CD release workflow.

## Commit Messages and Pull Requests

- Follow the [Chris Beams](https://chris.beams.io/posts/git-commit/) style for commit messages.
- Use the angular commit message format. Such as: `fix: <description>`, `feat: <description>`, `refactor: <description>`, `test: <description>`, `docs: <description>`, `chore: <description>`.

- Every pull request should answer:
  - What changed?
  - Why?
  - Breaking changes?
