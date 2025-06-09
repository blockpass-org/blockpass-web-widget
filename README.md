# Blockpass Web Widget

This repository contains the Blockpass Web Widget implementation and example integrations.

## Project Structure

This is a monorepo project using workspaces:

- `packages/` - Contains the core widget implementation
- `examples/` - Contains example integrations and usage demonstrations

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2.15 or later

### Installation

Install dependencies for all workspaces:

```bash
bun install
```

## Examples

### React Client Site Example

Located in `examples/react-csp/`, this example demonstrates how to integrate the Blockpass Web Widget in a React application with Client Site.

To run the React Client Site example:

```bash
bun example:react:dev
```

## Development

### Building Packages

To build sdk packages:

```bash
bun run sdk:build
```

### Packing Packages as tgz (tarball + gzip)

To pack sdk packages:

```bash
bun run sdk:pack

# Output
packed 488B package.json
packed 26B dist/index.d.ts
packed 26B dist/index.js
packed 1.62KB dist/widget.d.ts
packed 6.79KB dist/widget.js

blockpass-web-widget-0.0.1.tgz

Total files: 5
Shasum: d1eaa64884dbfc0abb92731fd0114de22deaa7a9
Integrity: sha512-AqYCfQEu+SUFt[...]gx5/c9jiTKWVA==
Unpacked size: 8.95KB
Packed size: 2.36KB
```

This tarball can be used in two ways:

1. **Publishing**: You can publish it to npm or any other registry using the [publish command](https://bun.sh/docs/cli/publish). Make sure you have the necessary registry key.
2. **Installation in Other Projects**: You can install the tarball in other projects with the following command:

```bash
npm install blockpass-web-widget-0.0.1.tgz
```
