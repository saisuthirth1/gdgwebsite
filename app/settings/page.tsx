"use client"

import { useState } from "react"
import { ArrowLeft, Bell, Clock, Lock, Shield, User } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [sessionTimeout, setSessionTimeout] = useState("15")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <Tabs defaultValue="security">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security settings for the voting verification system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout</Label>
                    <div className="flex items-center gap-4">
                      <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                        <SelectTrigger id="session-timeout" className="w-[180px]">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          System will automatically log out after inactivity
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Audit Logging</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Enable detailed audit logs</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Log all verification attempts</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Log officer actions</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Tampering Detection</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Enable tampering detection</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Send alerts to administrators</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Lock system on suspected tampering</span>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Settings
                </CardTitle>
                <CardDescription>Configure verification methods and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Verification Mode</Label>
                    <RadioGroup defaultValue="enhanced">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard">Standard (Fingerprint only)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="enhanced" id="enhanced" />
                        <Label htmlFor="enhanced">Enhanced (Fingerprint + Voice)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Fingerprint Verification</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Require high confidence match</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Allow retry on failure</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Maximum retry attempts</span>
                        </div>
                        <Select defaultValue="3">
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Voice Verification</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Enable voice verification</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Minimum recording duration</span>
                        </div>
                        <Select defaultValue="5">
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 seconds</SelectItem>
                            <SelectItem value="5">5 seconds</SelectItem>
                            <SelectItem value="10">10 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Allow retry on failure</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Blockchain Settings</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Record all verifications on blockchain</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Wait for confirmation before proceeding</span>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>System Alerts</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Security alerts</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Verification failures</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>System status updates</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Alert Methods</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>In-app notifications</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>Email alerts</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>SMS alerts</span>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="alert-email">Alert Email</Label>
                    <Input
                      id="alert-email"
                      placeholder="Enter email for alerts"
                      defaultValue="admin@votingsystem.gov"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your officer account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="officer-name">Officer Name</Label>
                    <Input id="officer-name" defaultValue="John Doe" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officer-id">Officer ID</Label>
                    <Input id="officer-id" defaultValue="OFF-12345" readOnly />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
                <CardDescription>Actions that can't be undone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reset All Settings</h4>
                    <p className="text-sm text-muted-foreground">Reset all settings to default values</p>
                  </div>
                  <Button variant="outline" className="text-red-500">
                    Reset
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Log Out From All Devices</h4>
                    <p className="text-sm text-muted-foreground">End all active sessions</p>
                  </div>
                  <Button variant="outline" className="text-red-500">
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

