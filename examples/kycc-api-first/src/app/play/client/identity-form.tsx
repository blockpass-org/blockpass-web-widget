"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileImage, User, Coins, AlertCircle } from "lucide-react";
import { EnhancedFileUpload } from "@/components/enhanced-file-upload";

import { serverActionSubmit, type FormData } from "../actions";

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
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter crypto address labels based on allowed types
  const filteredCryptoAddressLabels = Object.entries(
    cryptoAddressLabels
  ).reduce((acc, [key, label]) => {
    if (
      !allowedCryptoTypes ||
      allowedCryptoTypes.includes(key as CryptoAddressType)
    ) {
      acc[key as CryptoAddressType] = label;
    }
    return acc;
  }, {} as Record<CryptoAddressType, string>);

  // Filter identity document types based on allowed types
  const filteredIdentityTypes =
    allowedIdentityTypes ||
    (["passport", "national_id", "driving_license"] as const);

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

  const handleSelfieUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      e.preventDefault();
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      setFormData((prev) => ({
        ...prev,
        selfie: {
          value_base64: base64Data,
          mime_type: file.type as "image/jpeg" | "image/png",
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProofOfAddressUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      setFormData((prev) => ({
        ...prev,
        proof_of_address: {
          value_base64: base64Data,
          mime_type: file.type as "image/jpeg" | "image/png",
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleIdentityDocumentUpload = async (
    file: File,
    side: "front" | "back"
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      setFormData((prev) => {
        const prev_identity_documents: any = prev.identity_documents ?? {};
        return {
          ...prev,
          identity_documents: {
            ...prev_identity_documents,
            type: prev.identity_documents?.type || "passport",
            [side]: {
              value_base64: base64Data,
              mime_type: file.type as "image/jpeg" | "image/png",
            },
          },
        };
      });
    };
    reader.readAsDataURL(file);
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

    if (submitData.dob) {
      const [year, month, day] = submitData.dob.split("-");
      submitData.dob = `${month}/${day}/${year}`;
    }

    try {
      await serverActionSubmit(submitData as any);
      alert("Identity verification form submitted successfully!");
    } catch (error) {
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Identity Verification Form
          </CardTitle>
          <CardDescription>
            Please provide the required information and documents to complete
            your identity verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 font-medium flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  Please fix the following errors:
                </h3>
                <ul className="list-disc list-inside text-red-700 space-y-1">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Information */}
            {(requiredFields.includes("email") ||
              requiredFields.includes("given_name") ||
              requiredFields.includes("family_name") ||
              requiredFields.includes("dob")) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <CardDescription>
                  Please ensure your Given Name and Family Name match your
                  identity document. For multiple names, include all in the
                  respective fields. If a name is not applicable, please specify
                  "N/A". For more details, refer to the{" "}
                  <a
                    href="https://help.blockpass.org/hc/en-us/articles/360045088314-Name-Entry-Guidelines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Blockpass Name Entry Guidelines
                  </a>
                  .
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredFields.includes("given_name") && (
                    <div className="space-y-2">
                      <Label htmlFor="given_name">Given Name *</Label>
                      <Input
                        id="given_name"
                        value={formData.given_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            given_name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                  {requiredFields.includes("family_name") && (
                    <div className="space-y-2">
                      <Label htmlFor="family_name">Family Name *</Label>
                      <Input
                        id="family_name"
                        value={formData.family_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            family_name: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requiredFields.includes("email") && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  )}
                  {requiredFields.includes("dob") && (
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cryptocurrency Address */}
            {requiredFields.includes("crypto_address") && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Cryptocurrency Address
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crypto_type">Cryptocurrency Type</Label>
                        <Select
                          value={formData.crypto_address?.type || ""}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              crypto_address: {
                                ...prev.crypto_address,
                                type: value as any,
                                value: prev.crypto_address?.value || "",
                              },
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select cryptocurrency" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(filteredCryptoAddressLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crypto_value">Wallet Address</Label>
                        <Input
                          id="crypto_value"
                          value={formData.crypto_address?.value || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              crypto_address: {
                                ...prev.crypto_address,
                                type:
                                  prev.crypto_address?.type ||
                                  "crypto_address_btc",
                                value: e.target.value,
                              },
                            }))
                          }
                          placeholder="Enter your wallet address"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Document Uploads */}
            {(requiredFields.includes("identity_documents") ||
              requiredFields.includes("selfie") ||
              requiredFields.includes("proof_of_address")) && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Document Uploads
                </h3>

                {/* Identity Documents */}
                {requiredFields.includes("identity_documents") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Identity Document
                      </CardTitle>
                      <CardDescription>
                        Upload a live picture of your physical ID document.
                        Ensure all four corners are visible, minimize
                        glare/shadows, and use good lighting. For more details,
                        refer to the{" "}
                        <a
                          href="https://help.blockpass.org/hc/en-us/articles/360024364214-Perfect-ID-Photo-Guide"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Blockpass Perfect ID Photo Guide
                        </a>
                        .
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="id_type">Document Type</Label>
                          <Select
                            value={formData.identity_documents?.type || ""}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                identity_documents: {
                                  ...prev.identity_documents,
                                  type: value as
                                    | "passport"
                                    | "national_id"
                                    | "driving_license",
                                  front: prev.identity_documents?.front,
                                },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredIdentityTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type
                                    .split("_")
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Front Side */}
                        {formData.identity_documents?.type && (
                          <div>
                            <EnhancedFileUpload
                              id="identity_doc_front"
                              label="Document Front Side"
                              description=""
                              onFileUpload={(file) =>
                                handleIdentityDocumentUpload(file, "front")
                              }
                              uploadedFile={formData.identity_documents?.front}
                              onRemoveFile={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  identity_documents: {
                                    ...prev.identity_documents,
                                    type:
                                      prev.identity_documents?.type ||
                                      "passport",
                                    front: undefined,
                                  },
                                }))
                              }
                            />
                          </div>
                        )}

                        {/* Back Side - Optional for some documents */}
                        {formData.identity_documents?.type &&
                          formData.identity_documents.type !== "passport" && (
                            <div>
                              <EnhancedFileUpload
                                id="identity_doc_back"
                                label="Document Back Side (Optional)"
                                description="Upload or capture the back side of your identity document if applicable"
                                onFileUpload={(file) =>
                                  handleIdentityDocumentUpload(file, "back")
                                }
                                uploadedFile={formData.identity_documents?.back}
                                onRemoveFile={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    identity_documents: {
                                      ...prev.identity_documents,
                                      type:
                                        prev.identity_documents?.type ||
                                        "passport",
                                      back: undefined,
                                    },
                                  }))
                                }
                              />
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selfie Upload */}
                {requiredFields.includes("selfie") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Selfie Photo</CardTitle>
                      <CardDescription>
                        Upload a clear photo of yourself where your face is
                        entirely visible and matches your identity document.
                        Avoid screenshots and ensure good lighting. For more
                        details, refer to the{" "}
                        <a
                          href="https://help.blockpass.org/hc/en-us/articles/360024532713-Selfie-Rejection-Reasons"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Blockpass Selfie Rejection Reasons
                        </a>
                        .
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EnhancedFileUpload
                        id="selfie"
                        label="Selfie Photo"
                        description=""
                        onFileUpload={handleSelfieUpload}
                        uploadedFile={formData.selfie}
                        onRemoveFile={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selfie: undefined,
                          }))
                        }
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Proof of Address */}
                {requiredFields.includes("proof_of_address") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Proof of Address
                      </CardTitle>
                      <CardDescription>
                        Upload a utility bill, bank statement, or
                        government-issued document issued within the last 3
                        months, clearly showing your full name, current
                        residential address, issue date, and issuer. For more
                        details, refer to the{" "}
                        <a
                          href="https://help.blockpass.org/hc/en-us/articles/360043833034-Proof-of-Address-Requirements"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Blockpass Proof of Address Requirements
                        </a>
                        .
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EnhancedFileUpload
                        id="proof_of_address"
                        label="Proof of Address"
                        description=""
                        onFileUpload={handleProofOfAddressUpload}
                        uploadedFile={formData.proof_of_address}
                        onRemoveFile={() =>
                          setFormData((prev) => ({
                            ...prev,
                            proof_of_address: undefined,
                          }))
                        }
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
