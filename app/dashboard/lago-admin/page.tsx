'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  RefreshCw,
  Download,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

// Mock data - In production, this would come from your API
const mockCustomers = [
  {
    id: 'user_abc123',
    name: 'John Doe',
    email: 'john@example.com',
    credits: 1250,
    spent: 450,
    status: 'active',
    lastActive: '2 hours ago',
  },
  {
    id: 'user_def456',
    name: 'Jane Smith',
    email: 'jane@example.com',
    credits: 50,
    spent: 1200,
    status: 'low',
    lastActive: '1 day ago',
  },
  {
    id: 'user_ghi789',
    name: 'Acme Corp',
    email: 'billing@acme.com',
    credits: 5000,
    spent: 2500,
    status: 'active',
    lastActive: '5 minutes ago',
  },
  {
    id: 'user_jkl012',
    name: 'Tech Startup',
    email: 'admin@startup.com',
    credits: 10,
    spent: 890,
    status: 'critical',
    lastActive: '3 hours ago',
  },
];

const mockRecentTransactions = [
  {
    id: 'tx_001',
    customer: 'John Doe',
    type: 'purchase',
    amount: 500,
    credits: 500,
    date: '2024-01-15 14:30',
  },
  {
    id: 'tx_002',
    customer: 'Acme Corp',
    type: 'purchase',
    amount: 5000,
    credits: 5000,
    date: '2024-01-15 12:15',
  },
  {
    id: 'tx_003',
    customer: 'Jane Smith',
    type: 'usage',
    amount: -50,
    credits: -50,
    date: '2024-01-15 11:45',
  },
];

export default function LagoAdminDashboard() {
  const totalRevenue = 138596;
  const totalCustomers = 1482;
  const totalCreditsIssued = 256000;
  const totalCreditsUsed = 184500;
  const creditsUsagePercent = (totalCreditsUsed / totalCreditsIssued) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lago Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor billing, credits, and customer activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              18.2% from last month
            </p>
            <Progress value={75} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              12.5% from last month
            </p>
            <Progress value={65} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Issued</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500" />
              22.1% from last month
            </p>
            <Progress value={85} className="mt-3 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditsUsagePercent.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalCreditsUsed.toLocaleString()} / {totalCreditsIssued.toLocaleString()} used
            </p>
            <Progress value={creditsUsagePercent} className="mt-3 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>View and manage customer accounts</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search customers..." className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Credits Balance</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <span className="font-mono">{customer.credits.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{customer.spent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {customer.status === 'active' && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                        )}
                        {customer.status === 'low' && (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">
                            Low Credits
                          </Badge>
                        )}
                        {customer.status === 'critical' && (
                          <Badge variant="destructive">Critical</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest credit purchases and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                      <TableCell>{tx.customer}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'purchase' ? 'default' : 'outline'}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={tx.credits > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {tx.credits > 0 ? '+' : ''}
                          {tx.credits.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>${Math.abs(tx.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                Revenue chart will be displayed here
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits Usage</CardTitle>
                <CardDescription>Credit consumption patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                Usage chart will be displayed here
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                Growth chart will be displayed here
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>Most used services by credits</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
                Services breakdown chart will be displayed here
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
