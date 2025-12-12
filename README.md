# Palette SDK TypeScript

A TypeScript SDK for the Spectro Cloud Palette API. This package provides a comprehensive set of functions to manage Kubernetes clusters, applications, and cloud resources through the Palette API.

> [!WARNING]
> This is an experimental SDK and subject to change.

## Features

- **Complete API Coverage**: All Palette API endpoints are supported
- **Comprehensive TypeScript Support**: Full type definitions for all API requests and responses.
- **No Type Casting Required**: Clean, typed API calls without `any` casting
- **Fetch-based**: Built on the modern Fetch API
- **Tree-shakable**: Import only the functions you need

## Installation

```bash
npm install palette-sdk-typescript
```

> [!IMPORTANT]
> This package is published as TypeScript source code. You'll need TypeScript in your project to use it. If you're using JavaScript, you may need to configure your build tools to handle TypeScript files.

- Node.js 22 or higher
- TypeScript 5.5 or higher
- A Palette API key and project UID

## Getting Started

### Authentication

To use the Palette API, you need an API key. Check the [Create API Key](https://docs.spectrocloud.com/user-management/authentication/api-key/create-api-key/) guide for more information.

Set the API key as an environment variable:

```bash
export PALETTE_API_KEY="your-api-key-here"
export PROJECT_UID="your-project-uid-here"
```

### Usage

Import the specific API functions and types you need.

```typescript
import {
  spectroClustersMetadataGet,
  setPaletteBaseUrl,
  getPaletteBaseUrl,
  type SpectroClustersMetadata,
} from "palette-sdk-typescript";


// Configure authentication
const config = {
  headers: {
    ApiKey: process.env.PALETTE_API_KEY,
    "Content-Type": "application/json",
    ProjectUID: process.env.PROJECT_UID, // Optional, for project-scoped requests
  },
  // Configure custom base URL (optional)
  // By default, the SDK uses https://api.spectrocloud.com
  baseUrl: 'https://your-palette-host.com'
};

// Get all clusters
const response: SpectroClustersMetadata = await spectroClustersMetadataGet(
  {}, // no filter params provided in this example
  config
);

if (response.items && response.items.length > 0) {
  console.log("First cluster metadata:", response.items[0]);
}
```

If a project UID is not specified, then the Palette API will use the tenant scope. Keep this in mind when using the SDK. There may be some cases where you want to use the tenant scope.

### Base URL Configuration

By default, the PaletteSDK targets `https://api.spectrocloud.com`. If you have a different Palette instance, such as a self-hosted Palette instance, you can configure the base URL.
```typescript
const config = {
  headers: {
    ApiKey: process.env.PALETTE_API_KEY,
    "Content-Type": "application/json",
    ProjectUID: process.env.PROJECT_UID,
  },
  // Set custom base URL
  baseUrl: 'https://your-palette-host.com'
};

const response: SpectroClustersMetadata = await spectroClustersMetadataGet(
  {},
  config
);
```
The SDK will now use your custom URL(`https://your-palette-host.com`) for all API calls.

## Contributing

This SDK is generated from the Palette OpenAPI specification. To contribute:

1. Fork the repository
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

### Requirements

- Node.js 22 or higher
- Python 3.10 or higher
- Make
- [Copywrite](https://github.com/hashicorp/copywrite)
- Docker

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:

- **SDK Issues**: Open an issue on GitHub
- **API Documentation**: Visit the [Palette API Documentation](https://docs.spectrocloud.com/api/)
- **Palette Support**: Contact Spectro Cloud support

## Related Projects

- [Palette Terraform Provider](https://github.com/spectrocloud/terraform-provider-spectrocloud)
- [Palette CLI](https://github.com/spectrocloud/palette-cli)
- [Palette Go SDK](https://github.com/spectrocloud/palette-sdk-go)
