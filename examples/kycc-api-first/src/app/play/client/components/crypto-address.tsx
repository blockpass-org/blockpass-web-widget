import { Coins } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormData } from "../../actions";

type CryptoAddressType = NonNullable<FormData["crypto_address"]>["type"];

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

interface CryptoAddressProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  allowedCryptoTypes?: CryptoAddressType[];
}

export function CryptoAddress({
  formData,
  setFormData,
  allowedCryptoTypes,
}: CryptoAddressProps) {
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

  return (
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
                  setFormData({
                    ...formData,
                    crypto_address: {
                      ...formData.crypto_address,
                      type: value as any,
                      value: formData.crypto_address?.value || "",
                    },
                  })
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
                  setFormData({
                    ...formData,
                    crypto_address: {
                      ...formData.crypto_address,
                      type:
                        formData.crypto_address?.type || "crypto_address_btc",
                      value: e.target.value,
                    },
                  })
                }
                placeholder="Enter your wallet address"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
