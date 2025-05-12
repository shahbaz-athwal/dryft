import React from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@repo/ui/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@repo/ui/components/ui/tabs";
import { Input } from "@repo/ui/components/ui/input";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@repo/ui/components/ui/alert";
import { UITestHeader } from "@/components/ui-test-header";

export default function UITestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <UITestHeader />

      <div className="container mx-auto p-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">UI Component Visual Testing</h1>

        <Tabs defaultValue="buttons" className="mb-8">
          <TabsList>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Button Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>

            <h2 className="text-xl font-semibold mt-6">Button Sizes</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="p-4">
            <h2 className="text-xl font-semibold mb-4">Card Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Simple Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This is a basic card with just header and content.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card with Footer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>This card includes a footer with actions.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="mr-2">
                    Cancel
                  </Button>
                  <Button>Submit</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inputs" className="p-4 space-y-6">
            <h2 className="text-xl font-semibold">Input Elements</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Input
                </label>
                <Input placeholder="Type something..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Disabled Input
                </label>
                <Input disabled placeholder="Disabled input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Input with Icon
                </label>
                <div className="relative">
                  <Input placeholder="Search..." className="pl-8" />
                  <span className="absolute left-2.5 top-2.5">🔍</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Alert Components</h2>

            <Alert>
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert to provide information.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertTitle>Error Alert</AlertTitle>
              <AlertDescription>
                This is a destructive alert to indicate an error.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
