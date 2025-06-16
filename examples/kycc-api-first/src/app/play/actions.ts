"use server";

export interface FormData {
  email: string;
  given_name: string;
  family_name: string;
  dob: string;
  selfie?: {
    value_base64: string;
    mime_type: "image/jpeg" | "image/png";
  };
  proof_of_address?: {
    value_base64: string;
    mime_type: "image/jpeg" | "image/png";
  };
  identity_documents?: {
    type: "passport" | "national_id" | "driving_license";
    front?: {
      value_base64: string;
      mime_type: "image/jpeg" | "image/png";
    };
    back?: {
      value_base64: string;
      mime_type: "image/jpeg" | "image/png";
    };
  };
  crypto_address?: {
    type:
      | "crypto_address_btc"
      | "crypto_address_eth"
      | "crypto_address_bsc"
      | "crypto_address_matic"
      | "crypto_address_solana"
      | "crypto_address_cardano"
      | "crypto_address_arb"
      | "crypto_address_avax";
    value: string;
  };
}

export async function serverActionSubmit(formData: FormData) {
  console.log("server recieved data", formData);
}
