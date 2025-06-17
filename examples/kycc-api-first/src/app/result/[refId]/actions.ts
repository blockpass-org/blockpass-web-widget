"use server";

type KYCCFetchResponseBody =
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
        // Unique identifiers for the record.
        recordId: string;
        refId: string;

        // Current status of the record in the verification process.
        status:
          | "incomplete" // Initial state: Waiting for Blockpass to perform checks.
          | "waiting" // Blockpass checks are complete; awaiting operator review.
          | "inreview" // An operator is currently reviewing the record.
          | "approve" // The record has been approved by an operator.
          | "blocked" // The record has been blocked by an operator. Contact for more information.
          | "rejected" // An operator has rejected certain attributes; resubmission is required.
          | "review_requested"; // An operator has requested a new submission for data re-verification.

        // Timestamps (ISO format) for the latest checkpoint reached in the verification process.
        inreviewDate: any;
        waitingDate: any;
        approvedDate: any;
        reviewRequestedDate: any;

        // Timestamp (ISO format) indicating when the record is scheduled for archiving.
        willArchiveAtDate?: string;

        // Flag indicating if the record has been archived.
        isArchived?: boolean;
      };
    };

export async function generateKYCCDashboardLinkToRefId(refId?: string) {
  // Step 1: Get required environment variables for KYCC API
  const kycconnectBaseUrl = process.env["KYCC_BASE_URL"];
  const kycconnectClientId = process.env["KYCC_CLIENT_ID"];

  // Validate that all required environment variables are present
  if (!kycconnectBaseUrl || !kycconnectClientId) {
    throw new Error("Missing process.env");
  }

  if (refId) {
    return `${kycconnectBaseUrl}/kyc/dashboard/index.html#/${kycconnectClientId}/kyc_list?filters={"refId":"${refId}"}`;
  } else
    return `${kycconnectBaseUrl}/kyc/dashboard/index.html#/${kycconnectClientId}/kyc_list`;
}

export async function generateKYCCDashboardLinkToRecordId(recordId: string) {
  // Step 1: Get required environment variables for KYCC API
  const kycconnectBaseUrl = process.env["KYCC_BASE_URL"];
  const kycconnectClientId = process.env["KYCC_CLIENT_ID"];

  // Validate that all required environment variables are present
  if (!kycconnectBaseUrl || !kycconnectClientId) {
    throw new Error("Missing process.env");
  }

  return `${kycconnectBaseUrl}/kyc/dashboard/index.html#/${kycconnectClientId}/kyc_detail/${recordId}`;
}

export async function fetchKYCCStatus(refId: string) {
  // Step 1: Get required environment variables for KYCC API
  const kycconnectBaseUrl = process.env["KYCC_BASE_URL"];
  const kycconnectClientId = process.env["KYCC_CLIENT_ID"];
  const kycconnectReadApiKey = process.env["KYCC_READ_API_KEY"];

  // Validate that all required environment variables are present
  if (!kycconnectBaseUrl || !kycconnectClientId || !kycconnectReadApiKey) {
    throw new Error("Missing process.env");
  }

  const url = `${kycconnectBaseUrl}/kyc/1.0/connect/${kycconnectClientId}/refId/${refId}`;

  // Step 8: Make the API request to KYCC
  let data!: KYCCFetchResponseBody;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: kycconnectReadApiKey,
        "Content-Type": "application/json",
      },
    });

    data = await response.json();
  } catch (err: any) {
    console.error(err);
    return {
      status: "error",
      message: `KYCC http request error ${err.message}`,
      code: "",
      data: {
        extra: JSON.stringify(err),
      },
    } satisfies KYCCFetchResponseBody;
  }

  // Step 9: Handle API response
  if (data.status === "error") {
    return data;
  }

  return data;
}
