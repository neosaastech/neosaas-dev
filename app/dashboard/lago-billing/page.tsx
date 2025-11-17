'use client';

import { useState } from "react";
import { CreditBalanceCard } from "@/components/lago/credit-balance-card";
import { PurchaseCreditsForm } from "@/components/lago/purchase-credits-form";
import { InvoicesList } from "@/components/lago/invoices-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, FileText, BarChart3, Settings } from "lucide-react";

export default function LagoBillingPage() {
  // In a real app, you would get this from your auth session
  const [externalCustomerId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePurchaseSuccess = () => {
    // Refresh the credit balance card
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lago Billing</h1>
          <p className="text-muted-foreground">
            Manage your credits, view usage, and access invoices
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Customer ID: {externalCustomerId}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CreditBalanceCard
            key={refreshKey}
            externalCustomerId={externalCustomerId}
            onTopUp={() => {
              // Could open a modal or scroll to purchase form
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Usage Overview
              </CardTitle>
              <CardDescription>
                Track your credit consumption and service usage
              </CardDescription>
            </CardHeader>
            <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
              Usage charts will be displayed here
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="purchase" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchase">
            <Coins className="mr-2 h-4 w-4" />
            Purchase Credits
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchase">
          <div className="grid gap-6 md:grid-cols-2">
            <PurchaseCreditsForm
              externalCustomerId={externalCustomerId}
              onSuccess={handlePurchaseSuccess}
            />

            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
                <CardDescription>How credits work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Credit Usage</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• API Call: 1 credit</li>
                    <li>• Storage (1GB/month): 10 credits</li>
                    <li>• Compute (1 hour): 50 credits</li>
                    <li>• AI Processing: 5 credits per request</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• No expiration on credits</li>
                    <li>• Volume discounts available</li>
                    <li>• Bonus credits with larger packages</li>
                    <li>• Rollover unused credits</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesList externalCustomerId={externalCustomerId} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>
                Configure your billing preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Notifications</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Email me when credits fall below 20</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Send monthly usage reports</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>Notify on large purchases</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Auto Top-Up</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Automatically purchase credits when your balance is low
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  <span>Enable auto top-up (Coming soon)</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
