import { User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "../../actions";

interface PersonalInformationProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  requiredFields: (keyof FormData)[];
}

export function PersonalInformation({
  formData,
  setFormData,
  requiredFields,
}: PersonalInformationProps) {
  if (
    !requiredFields.includes("email") &&
    !requiredFields.includes("given_name") &&
    !requiredFields.includes("family_name") &&
    !requiredFields.includes("dob")
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        Personal Information
      </h3>
      <Card>
        <CardHeader>
          <CardDescription>
            Please ensure your Given Name and Family Name match your identity
            document. For multiple names, include all in the respective fields.
            If a name is not applicable, please specify N/A. For more details,
            refer to the{" "}
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredFields.includes("given_name") && (
              <div className="space-y-2">
                <Label htmlFor="given_name">Given Name *</Label>
                <Input
                  id="given_name"
                  value={formData.given_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      given_name: e.target.value,
                    })
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
                  value={formData.family_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      family_name: e.target.value,
                    })
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
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
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
                  value={formData.dob || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dob: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
