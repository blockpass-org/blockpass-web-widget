import IdentityVerificationForm from "./client/identity-form";

export default function Play() {
  return (
    <main>
      <div>
        <IdentityVerificationForm
          requiredFields={["identity_documents", "crypto_address"]}
          allowedCryptoTypes={["crypto_address_bsc"]}
          allowedIdentityTypes={["passport"]}
        />
      </div>
    </main>
  );
}
