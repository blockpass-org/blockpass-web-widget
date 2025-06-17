import IdentityVerificationForm from "./client/identity-form";

export default function Play() {
  return (
    <main>
      <div>
        <IdentityVerificationForm
          // for testing with - dev_test_kycc_api_beta_01_f307c - cryptoAML
          // requiredFields={["crypto_address"]}
          // allowedCryptoTypes={["crypto_address_eth"]}

          // for testing with - id_api - idDoc only
          requiredFields={[
            "identity_documents",
            "family_name",
            "given_name",
            "email",
            "dob",
          ]}
        />
      </div>
    </main>
  );
}
