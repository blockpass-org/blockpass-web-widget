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

### React CSP Example

Located in `examples/react-csp/`, this example demonstrates how to integrate the Blockpass Web Widget in a React application with Content Security Policy (CSP).

To run the React CSP example:

```bash
cd examples/react-csp
bun install
bun dev
```

## Development

### Building Packages

To build all packages:

```bash
bun run build
```

### Running Tests

To run tests across all packages:

```bash
bun test
```

## License

[Add license information here]

## Contributing

[Add contribution guidelines here]
