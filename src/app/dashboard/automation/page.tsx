// app/dashboard/automation/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Plus, 
  Play, 
  Pause,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AutomationDashboard() {
  const [stats, setStats] = useState({
    activeRules: 0,
    messagesSent: 0,
    messagesPending: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [rulesRes, queueRes, analyticsRes] = await Promise.all([
        fetch("/api/automation/rules"),
        fetch("/api/automation/queue/status"),
        fetch("/api/automation/analytics"),
      ]);

      const rules = await rulesRes.json();
      const queue = await queueRes.json();
      const analytics = await analyticsRes.json();

      setStats({
        activeRules: rules.filter((r: any) => r.isActive).length,
        messagesSent: queue.sentToday || 0,
        messagesPending: queue.byStatus?.PENDING || 0,
        conversionRate: analytics.conversionRate || 0,
      });
    } catch (error) {
      toast.error("Failed to load automation stats");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Social Media Automation
          </h1>
          <p className="text-muted-foreground">
            Automate DMs for comments, follows, and engagement
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/automation/rules">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/automation/templates">
              <MessageSquare className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rules
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">Automation rules running</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Messages Sent Today
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesSent}</div>
            <p className="text-xs text-muted-foreground">Automated DMs delivered</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Queue Pending
            </CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messagesPending}</div>
            <p className="text-xs text-muted-foreground">Messages waiting to send</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">DM to response rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Zap className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Play className="h-4 w-4 mr-2" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Users className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>Set up your first automation in 5 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium">Connect your social accounts</p>
                    <p className="text-muted-foreground">Link LinkedIn, Instagram, Twitter to enable automation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium">Create a DM template</p>
                    <p className="text-muted-foreground">Write personalized messages with variables like {"{{name}}"}, {"{{post}}"}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium">Set up automation rules</p>
                    <p className="text-muted-foreground">Define triggers (comment, follow) and actions (send DM)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium">Monitor & optimize</p>
                    <p className="text-muted-foreground">Track performance and adjust based on response rates</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚠️ Important Compliance Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>LinkedIn: Max 50 DMs/day to avoid account restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>Instagram: Only DM followers or use ManyChat for compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>Always include opt-out option in messages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>Provide genuine value, not spam</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  <span>Respect platform rate limits to avoid bans</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Manage your automation triggers and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/automation/rules">
                  Manage Rules
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Message Queue</CardTitle>
              <CardDescription>View and manage pending messages</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/automation/queue">
                  View Queue
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>Manage opt-outs and compliance settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/automation/compliance">
                  Manage Compliance
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}