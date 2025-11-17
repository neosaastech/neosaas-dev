'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface WalletData {
  total_balance: string;
  paid_credits: string;
  granted_credits: string;
  currency: string;
}

interface CreditBalanceCardProps {
  externalCustomerId: string;
  onTopUp?: () => void;
}

export function CreditBalanceCard({ externalCustomerId, onTopUp }: CreditBalanceCardProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallet();
  }, [externalCustomerId]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/lago/wallets?external_customer_id=${externalCustomerId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setWallet(null);
          return;
        }
        throw new Error('Failed to fetch wallet');
      }

      const data = await response.json();
      setWallet(data.wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Credit Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error: {error}</div>
          <Button onClick={fetchWallet} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Credit Balance
          </CardTitle>
          <CardDescription>No wallet found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You don&apos;t have a wallet yet. Purchase credits to get started.
          </p>
          {onTopUp && (
            <Button onClick={onTopUp} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Purchase Credits
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const balance = parseFloat(wallet.total_balance);
  const balanceStatus = balance > 100 ? 'good' : balance > 20 ? 'warning' : 'low';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          Credit Balance
        </CardTitle>
        {balanceStatus === 'good' && (
          <Badge className="bg-emerald-500 hover:bg-emerald-600">Healthy</Badge>
        )}
        {balanceStatus === 'warning' && (
          <Badge variant="outline" className="border-amber-500 text-amber-500">Low</Badge>
        )}
        {balanceStatus === 'low' && (
          <Badge variant="destructive">Critical</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {balance.toLocaleString()} {wallet.currency}
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Paid Credits</span>
            <span className="font-medium text-foreground">{parseFloat(wallet.paid_credits).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Bonus Credits</span>
            <span className="font-medium text-foreground">{parseFloat(wallet.granted_credits).toLocaleString()}</span>
          </div>
        </div>
        {onTopUp && (
          <Button onClick={onTopUp} className="w-full mt-4" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Top Up Credits
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
