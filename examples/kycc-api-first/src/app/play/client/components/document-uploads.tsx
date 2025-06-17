import { FileImage } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedFileUpload } from "@/components/enhanced-file-upload";
import type { FormData } from "../../actions";

type IdentityDocumentType = NonNullable<FormData["identity_documents"]>["type"];

interface DocumentUploadsProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  requiredFields: (keyof FormData)[];
  allowedIdentityTypes?: IdentityDocumentType[];
}

export function DocumentUploads({
  formData,
  setFormData,
  requiredFields,
  allowedIdentityTypes,
}: DocumentUploadsProps) {
  if (
    !requiredFields.includes("identity_documents") &&
    !requiredFields.includes("selfie") &&
    !requiredFields.includes("proof_of_address")
  ) {
    return null;
  }

  const filteredIdentityTypes =
    allowedIdentityTypes ||
    (["passport", "national_id", "driving_license"] as const);

  const handleSelfieUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      e.preventDefault();
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      setFormData({
        ...formData,
        selfie: {
          value_base64: base64Data,
          mime_type: file.type as "image/jpeg" | "image/png",
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProofOfAddressUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      setFormData({
        ...formData,
        proof_of_address: {
          value_base64: base64Data,
          mime_type: file.type as "image/jpeg" | "image/png",
        },
      });
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

      setFormData({
        ...formData,
        identity_documents: {
          ...formData.identity_documents,
          type: formData.identity_documents?.type || "passport",
          [side]: {
            value_base64: base64Data,
            mime_type: file.type as "image/jpeg" | "image/png",
          },
        },
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileImage className="h-5 w-5" />
        Document Uploads
      </h3>

      {/* Identity Documents */}
      {requiredFields.includes("identity_documents") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity Document</CardTitle>
            <CardDescription>
              Upload a picture or take a live photo of your physical ID
              document. Ensure all four corners are visible, minimize
              glare/shadows, and use good lighting. For more details, refer to
              the{" "}
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
                    setFormData({
                      ...formData,
                      identity_documents: {
                        ...formData.identity_documents,
                        type: value as
                          | "passport"
                          | "national_id"
                          | "driving_license",
                        front: formData.identity_documents?.front,
                      },
                    })
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
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
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
                      setFormData({
                        ...formData,
                        identity_documents: {
                          ...formData.identity_documents,
                          type: formData.identity_documents?.type || "passport",
                          front: undefined,
                        },
                      })
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
                        setFormData({
                          ...formData,
                          identity_documents: {
                            ...formData.identity_documents,
                            type:
                              formData.identity_documents?.type || "passport",
                            back: undefined,
                          },
                        })
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
              Upload a clear picture of yourself or take a live photo. Your face
              must be entirely visible and must match your identity document.
              Avoid screenshots and ensure good lighting. For more details,
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
                setFormData({
                  ...formData,
                  selfie: undefined,
                })
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Proof of Address */}
      {requiredFields.includes("proof_of_address") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proof of Address</CardTitle>
            <CardDescription>
              Upload a utility bill, bank statement, or government-issued
              document issued within the last 3 months, clearly showing your
              full name, current residential address, issue date, and issuer.
              For more details, refer to the{" "}
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
                setFormData({
                  ...formData,
                  proof_of_address: undefined,
                })
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
