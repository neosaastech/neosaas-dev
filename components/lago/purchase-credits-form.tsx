'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PurchaseCreditsFormProps {
  externalCustomerId: string;
  onSuccess?: () => void;
}

const CREDIT_PACKAGES = [
  { value: '100', label: '100 Credits - $10', credits: 100, price: 10 },
  { value: '500', label: '500 Credits - $45', credits: 500, price: 45 },
  { value: '1000', label: '1000 Credits - $80', credits: 1000, price: 80 },
  { value: '5000', label: '5000 Credits - $350', credits: 5000, price: 350 },
  { value: 'custom', label: 'Custom Amount', credits: 0, price: 0 },
];

export function PurchaseCreditsForm({ externalCustomerId, onSuccess }: PurchaseCreditsFormProps) {
  const [selectedPackage, setSelectedPackage] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const credits = selectedPackage === 'custom'
        ? customAmount
        : CREDIT_PACKAGES.find(p => p.value === selectedPackage)?.credits || 0;

      if (!credits || parseFloat(credits.toString()) <= 0) {
        toast.error("Invalid amount", {
          description: "Please enter a valid credit amount",
        });
        return;
      }

      // First, check if customer exists
      const customerResponse = await fetch(`/api/lago/customers?external_id=${externalCustomerId}`);

      // If customer doesn't exist, create one
      if (customerResponse.status === 404) {
        const createCustomerResponse = await fetch('/api/lago/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            external_id: externalCustomerId,
            name: `Customer ${externalCustomerId}`,
            email: `${externalCustomerId}@example.com`, // Should be replaced with actual email
            currency: 'USD',
          }),
        });

        if (!createCustomerResponse.ok) {
          throw new Error('Failed to create customer');
        }
      }

      // Create or top up wallet
      const walletResponse = await fetch('/api/lago/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          external_customer_id: externalCustomerId,
          paid_credits: credits.toString(),
          currency: 'USD',
          name: 'Main Wallet',
        }),
      });

      if (!walletResponse.ok) {
        const error = await walletResponse.json();
        throw new Error(error.error || 'Failed to purchase credits');
      }

      toast.success("Success!", {
        description: `${credits} credits have been added to your account`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Purchase failed", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Purchase Credits
        </CardTitle>
        <CardDescription>
          Top up your account with credits to use our services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="package">Select Package</Label>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger id="package">
              <SelectValue placeholder="Choose a package" />
            </SelectTrigger>
            <SelectContent>
              {CREDIT_PACKAGES.map((pkg) => (
                <SelectItem key={pkg.value} value={pkg.value}>
                  {pkg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPackage === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Custom Amount</Label>
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter credit amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
            />
          </div>
        )}

        <div className="rounded-lg bg-muted p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Credits</span>
            <span className="font-medium">
              {selectedPackage === 'custom'
                ? customAmount || '0'
                : CREDIT_PACKAGES.find(p => p.value === selectedPackage)?.credits || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Price</span>
            <span className="font-bold text-lg">
              $
              {selectedPackage === 'custom'
                ? (parseFloat(customAmount || '0') * 0.1).toFixed(2)
                : CREDIT_PACKAGES.find(p => p.value === selectedPackage)?.price || 0}
            </span>
          </div>
        </div>

        <Button
          onClick={handlePurchase}
          disabled={loading || (selectedPackage === 'custom' && !customAmount)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Purchase Credits'
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Credits will be added to your account immediately upon purchase
        </p>
      </CardContent>
    </Card>
  );
}
