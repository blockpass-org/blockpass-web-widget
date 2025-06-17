"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";
import { serverActionSubmit, type FormData } from "../actions";
import { ErrorSummary } from "./components/error-summary";
import { PersonalInformation } from "./components/personal-information";
import { CryptoAddress } from "./components/crypto-address";
import { DocumentUploads } from "./components/document-uploads";

type CryptoAddressType = NonNullable<FormData["crypto_address"]>["type"];
type IdentityDocumentType = NonNullable<FormData["identity_documents"]>["type"];

const cryptoAddressLabels: Record<CryptoAddressType, string> = {
  crypto_address_btc: "Bitcoin (BTC)",
  crypto_address_eth: "Ethereum (ETH)",
  crypto_address_bsc: "Binance Smart Chain (BSC)",
  crypto_address_matic: "Polygon (MATIC)",
  crypto_address_solana: "Solana (SOL)",
  crypto_address_cardano: "Cardano (ADA)",
  crypto_address_arb: "Arbitrum (ARB)",
  crypto_address_avax: "Avalanche (AVAX)",
};

export type Props = {
  requiredFields?: (keyof FormData)[];
  allowedCryptoTypes?: CryptoAddressType[];
  allowedIdentityTypes?: IdentityDocumentType[];
};

export default function IdentityVerificationForm({
  requiredFields = [
    "email",
    "given_name",
    "family_name",
    "dob",
    "selfie",
    "identity_documents",
    "proof_of_address",
  ],
  allowedCryptoTypes,
  allowedIdentityTypes,
}: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace(/_/g, " ")} is required`;
      }
    });

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate date of birth
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    // Validate crypto address type if provided
    if (formData.crypto_address?.type) {
      if (
        allowedCryptoTypes &&
        !allowedCryptoTypes.includes(formData.crypto_address.type)
      ) {
        newErrors.crypto_address = `Selected cryptocurrency type is not allowed. Please choose from: ${allowedCryptoTypes
          .map((type) => cryptoAddressLabels[type])
          .join(", ")}`;
      }
      if (!formData.crypto_address.value) {
        newErrors.crypto_address =
          "Wallet address is required when cryptocurrency type is selected";
      }
    }

    // Validate identity documents
    if (requiredFields.includes("identity_documents")) {
      if (!formData.identity_documents?.type) {
        newErrors.identity_documents = "Document type is required";
      } else if (
        allowedIdentityTypes &&
        !allowedIdentityTypes.includes(formData.identity_documents.type)
      ) {
        newErrors.identity_documents = `Selected document type is not allowed. Please choose from: ${allowedIdentityTypes
          .map((type) =>
            type
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          )
          .join(", ")}`;
      } else if (!formData.identity_documents?.front) {
        newErrors.identity_documents = "Document front side is required";
      } else if (
        formData.identity_documents.type !== "passport" &&
        !formData.identity_documents?.back
      ) {
        newErrors.identity_documents =
          "Document back side is required for non-passport documents";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Add schema reference
    const submitData = {
      ...formData,
    };

    standalizeDob(submitData);

    try {
      const response = await serverActionSubmit(submitData as any);

      // Redirect to results page with the reference ID
      router.push(`/result/${response.refId}`);
    } catch (error: any) {
      setErrors({
        submit: `Failed to submit form. Error message: ${error.message}`,
      });
      setIsSubmitting(false);
    } finally {
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Identity Verification Form
            </h2>
          </CardTitle>
          <CardDescription>
            Please provide the required information and documents to complete
            your identity verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <ErrorSummary errors={errors} />

            <PersonalInformation
              formData={formData}
              setFormData={setFormData}
              requiredFields={requiredFields}
            />

            {requiredFields.includes("crypto_address") && (
              <CryptoAddress
                formData={formData}
                setFormData={setFormData}
                allowedCryptoTypes={allowedCryptoTypes}
              />
            )}

            <DocumentUploads
              formData={formData}
              setFormData={setFormData}
              requiredFields={requiredFields}
              allowedIdentityTypes={allowedIdentityTypes}
            />

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function standalizeDob(submitData: FormData) {
  if (submitData.dob) {
    const [year, month, day] = submitData.dob.split("-");
    submitData.dob = `${month}/${day}/${year}`;
  }
}
