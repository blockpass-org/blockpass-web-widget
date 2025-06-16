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
import { FileImage, User, Coins } from "lucide-react";
import { EnhancedFileUpload } from "@/components/enhanced-file-upload";

import { serverActionSubmit, type FormData } from "../actions";

export type Props = {};

export default function IdentityVerificationForm(props: Props) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    given_name: "",
    family_name: "",
    dob: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelfieUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
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
    setIsSubmitting(true);

    // Add schema reference
    const submitData = {
      ...formData,
    };

    if (submitData.dob) {
      const [year, month, day] = submitData.dob.split("-");
      submitData.dob = `${month}/${day}/${year}`;
    }

    console.log("Form Data:", submitData);

    // Simulate API call
    await serverActionSubmit(submitData as any);

    alert("Identity verification form submitted successfully!");
    setIsSubmitting(false);
  };

  const cryptoAddressLabels = {
    crypto_address_btc: "Bitcoin (BTC)",
    crypto_address_eth: "Ethereum (ETH)",
    crypto_address_bsc: "Binance Smart Chain (BSC)",
    crypto_address_matic: "Polygon (MATIC)",
    crypto_address_solana: "Solana (SOL)",
    crypto_address_cardano: "Cardano (ADA)",
    crypto_address_arb: "Arbitrum (ARB)",
    crypto_address_avax: "Avalanche (AVAX)",
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dob: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Cryptocurrency Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Cryptocurrency Address (Optional)
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
                          {Object.entries(cryptoAddressLabels).map(
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

            {/* Document Uploads */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Document Uploads
              </h3>

              {/* Identity Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Identity Document</CardTitle>
                  <CardDescription>
                    Upload a live picture of your physical ID document. Ensure
                    all four corners are visible, minimize glare/shadows, and
                    use good lighting. For more details, refer to the{" "}
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
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="national_id">
                            National ID
                          </SelectItem>
                          <SelectItem value="driving_license">
                            Driving License
                          </SelectItem>
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
                                  prev.identity_documents?.type || "passport",
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
                                    prev.identity_documents?.type || "passport",
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

              {/* Selfie Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selfie Photo</CardTitle>
                  <CardDescription>
                    Upload a clear photo of yourself where your face is entirely
                    visible and matches your identity document. Avoid
                    screenshots and ensure good lighting. For more details,
                    refer to the{" "}
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

              {/* Proof of Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proof of Address</CardTitle>
                  <CardDescription>
                    Upload a utility bill, bank statement, or government-issued
                    document issued within the last 3 months, clearly showing
                    your full name, current residential address, issue date, and
                    issuer. For more details, refer to the{" "}
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
            </div>

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
