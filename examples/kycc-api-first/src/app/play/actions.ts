"use server";

import { combineImage, detectImageType } from "@/lib/imgUtil";

export interface FormData {
  email?: string;
  given_name?: string;
  family_name?: string;
  dob?: string;
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

export type SubmitResponse = {
  clientId: string;
  recordId: string;
  refId: string;
};

type KYCCImportRequestBody = {
  email?: string;
  given_name?: string;
  family_name?: string;
  dob?: string;
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
    value_base64: string;
    mime_type: "image/jpeg" | "image/png";
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
};
type KYCCImportResponseBody =
  | {
      status: "error";
      message: string;
      code: string;
      data: {
        extra: any;
      };
    }
  | {
      status: "success";
      data: {
        recordId: string;
      };
    };

export async function serverActionSubmit(formData: FormData) {
  // Step 1: Get required environment variables for KYCC API
  const kycconnectBaseUrl = process.env["KYCC_BASE_URL"];
  const kycconnectClientId = process.env["KYCC_CLIENT_ID"];
  const kycconnectWriteApiKey = process.env["KYCC_WRITE_API_KEY"];

  // Validate that all required environment variables are present
  if (!kycconnectBaseUrl || !kycconnectClientId || !kycconnectWriteApiKey) {
    throw new Error("Missing process.env");
  }

  // Step 2: Initialize the request body with basic user information
  const body: KYCCImportRequestBody = {
    email: formData.email,
    given_name: formData.given_name,
    family_name: formData.family_name,
    crypto_address: formData.crypto_address,
  };

  // Step 3: Process selfie image if provided
  if (formData.selfie) {
    try {
      // Detect image type and validate the selfie
      const mineType = await detectImageType(
        Buffer.from(formData.selfie.value_base64, "base64")
      );

      body.selfie = {
        mime_type: mineType,
        value_base64: formData.selfie.value_base64,
      };
    } catch (err: any) {
      throw new Error(`Selfie error: ${err.message}`);
    }
  }

  // Step 4: Process proof of address document if provided
  if (formData.proof_of_address) {
    try {
      // Detect image type and validate the proof of address
      const mineType = await detectImageType(
        Buffer.from(formData.proof_of_address.value_base64, "base64")
      );

      body.proof_of_address = {
        mime_type: mineType,
        value_base64: formData.proof_of_address.value_base64,
      };
    } catch (err: any) {
      throw new Error(`Proof Of Address error: ${err.message}`);
    }
  }

  // Step 5: Process identity documents if provided
  if (formData.identity_documents) {
    let bufferFront: Buffer | undefined, bufferBack: Buffer | undefined;
    let frontMineType!: Awaited<ReturnType<typeof detectImageType>>;

    // Process front side of identity document
    if (formData.identity_documents.front) {
      try {
        bufferFront = Buffer.from(
          formData.identity_documents.front.value_base64,
          "base64"
        );
        frontMineType = await detectImageType(bufferFront);
      } catch (err: any) {
        throw new Error(`Selfie error: ${err.message}`);
      }
    }

    // Process back side of identity document if available
    if (formData.identity_documents.back) {
      try {
        bufferBack = Buffer.from(
          formData.identity_documents.back.value_base64,
          "base64"
        );
        const mineType = await detectImageType(bufferBack);
      } catch (err: any) {
        throw new Error(`Selfie error: ${err.message}`);
      }
    }

    // Validate that at least front side is provided
    if (!bufferFront) {
      throw new Error(`Identity Document error: require at least a front page`);
    }

    // Step 6: Handle identity document processing
    if (bufferFront && bufferBack) {
      // If both sides are provided, combine them into a single image
      const merged = await combineImage(bufferFront, bufferBack);
      body.identity_documents = {
        type: formData.identity_documents.type,
        mime_type: "image/jpeg",
        value_base64: merged.toString("base64"),
      };
    } else {
      // If only front side is provided, use it as is
      body.identity_documents = {
        type: formData.identity_documents.type,
        mime_type: frontMineType,
        value_base64: bufferFront.toString("base64"),
      };
    }
  }

  // Step 7: Generate a unique reference ID and construct the API URL
  const refId = Date.now().toString(32);
  const url = `${kycconnectBaseUrl}/kyc/1.0/connect/beta/${kycconnectClientId}/refId/${refId}`;

  // Step 8: Make the API request to KYCC
  let data!: KYCCImportResponseBody;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: kycconnectWriteApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (![201, 200].includes(response.status)) {
      throw new Error(`status is ${response.status}`);
    }

    data = await response.json();
  } catch (err: any) {
    console.error(err);
    throw new Error(`KYCC http request error: ${err.message}`);
  }

  // Step 9: Handle API response
  if (data.status === "error") {
    console.dir(data, { depth: 10 });
    throw new Error(`KYCC response with error: ${data.code} - ${data.message}`);
  }

  // Step 10: Return successful response with client ID, reference ID, and KYCC response
  return {
    clientId: kycconnectClientId,
    refId,
    kyccResponse: data,
  };
}
