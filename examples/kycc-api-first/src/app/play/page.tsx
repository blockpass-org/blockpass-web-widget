import IdentityVerificationForm from "./client/identity-form";

export default function Play() {
  return (
    <main>
      <div>
        <IdentityVerificationForm
          // for testing with cryptoAML
          // requiredFields={["crypto_address"]}
          // allowedCryptoTypes={["crypto_address_eth"]}

          // for testing with - id_api - idDoc only
          // requiredFields={[
          //   "identity_documents",
          //   "family_name",
          //   "given_name",
          //   "email",
          //   "dob",
          //   "address",
          // ]}

          // for testing with poa_api - IdDoc + proof of address
          requiredFields={[
            "identity_documents",
            "given_name",
            "family_name",
            "email",
            "dob",
            "address",
            "proof_of_address",
          ]}
        />
      </div>
    </main>
  );
}
