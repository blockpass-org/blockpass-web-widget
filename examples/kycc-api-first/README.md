# Blockpass KYCC API First Example

This is a Next.js example project demonstrating how to integrate with the Blockpass KYCC API. It provides a reference implementation for collecting and submitting KYC (Know Your Customer) data including:

- Personal Information (name, email, date of birth)
- Selfie Verification
- Proof of Address (resident address, proof of address document)
- Identity Documents (passport, national ID, driving license)
- Crypto Addresses

## Features

- Server-side form handling with Next.js Server Actions
- Type-safe form data submission
- Support for multiple document types and crypto addresses
- Modern UI with Tailwind CSS and shadcn/ui components

## Getting Started

1. Clone the repository and navigate to the example directory:

```bash
cd examples/kycc-api-first
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

   - Copy `env.template` to `.env.local`
   - Fill in your Blockpass KYCC API credentials:
     - `KYCC_CLIENT_ID`: Your Blockpass client ID
     - `KYCC_WRITE_API_KEY`: API key with write permissions
     - `KYCC_READ_API_KEY`: API key with read permissions
     - `KYCC_BASE_URL`: Blockpass KYCC API base URL (https://kyc.blockpass.org)

4. Run the development server:

```bash
bun run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/play/` - Main KYC form implementation
- `src/app/play/actions.ts` - Server actions for form submission
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and shared code

## Known Limitations

### Component Attributes Configuration

The Blockpass Web Widget requires manual configuration of component attributes to match Blockpass service requirements. These attributes need to be explicitly set based on your specific use case:

see `examples/kycc-api-first/src/app/play/page.tsx`

- For crypto AML verification:

  ```tsx
  requiredFields={["crypto_address"]}
  allowedCryptoTypes={["crypto_address_eth"]}
  ```

- For identity document verification:
  ```tsx
  requiredFields={[
    "identity_documents",
    "family_name",
    "given_name",
    "email",
    "dob"
  ]}
  ```

Make sure to configure these attributes according to your Blockpass service requirements before deploying the widget.

## Learn More

To learn more about the Blockpass KYCC API and Next.js:

- [Blockpass Documentation](https://docs.blockpass.org) - learn about Blockpass features and API
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
