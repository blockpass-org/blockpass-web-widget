import IdentityVerificationForm from "./client/identity-form";

export default function Play() {
  return (
    <main>
      <div>
        <IdentityVerificationForm
          requiredFields={["crypto_address"]}
          allowedCryptoTypes={["crypto_address_eth"]}
        />
      </div>
    </main>
  );
}
