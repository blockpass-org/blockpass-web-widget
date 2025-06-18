"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { FormData } from "../../actions";

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
  requiredFields?: (keyof FormData)[];
}

export function AddressInformation({
  formData,
  setFormData,
  requiredFields = [],
}: Props) {
  const isRequired = requiredFields.includes("address");

  const handleChange = (
    field: keyof NonNullable<FormData["address"]>,
    value: string
  ) => {
    const address: any = formData.address || {};
    setFormData({
      ...formData,
      address: {
        ...address,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        Address Information
      </h3>
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">
              Address Line 1{" "}
              {isRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="address"
              value={formData.address?.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              required={isRequired}
              placeholder="Enter your street address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extraInfo">Address Line 2</Label>
            <Input
              id="extraInfo"
              value={formData.address?.extraInfo || ""}
              onChange={(e) => handleChange("extraInfo", e.target.value)}
              placeholder="Apartment, suite, unit, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                City {isRequired && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="city"
                value={formData.address?.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                required={isRequired}
                placeholder="Enter your city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.address?.state || ""}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Enter your state/province"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                Postal Code{" "}
                {isRequired && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="postalCode"
                value={formData.address?.postalCode || ""}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                required={isRequired}
                placeholder="Enter your postal code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">
                Country {isRequired && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="country"
                value={formData.address?.country || ""}
                onChange={(e) => handleChange("country", e.target.value)}
                required={isRequired}
                placeholder="Enter country code (ISO3)"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
