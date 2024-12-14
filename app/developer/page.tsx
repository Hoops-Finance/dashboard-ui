"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardDocumentIcon, KeyIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const generateApiKey = () => {
    // Generate a random API key (in production, this should be done server-side)
    const key = 'hoops_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, newKey]);
    setGeneratedKey(key);
  };

  const copyToClipboard = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setNewKeyName("");
    setGeneratedKey(null);
    setCopied(false);
  };

  return (
    <section className="relative pt-16">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Developer Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your API keys and developer settings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <KeyIcon className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader className="space-y-1">
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  {!generatedKey 
                    ? "Give your API key a name to help you identify it later."
                    : "Copy your API key now. You won't be able to see it again!"}
                </DialogDescription>
              </DialogHeader>
              {!generatedKey ? (
                <div className="py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">API Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Development Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Your API Key</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm break-all">
                            {generatedKey}
                          </code>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(generatedKey)}
                            className="h-8 w-8 shrink-0"
                          >
                            {copied ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <p>
                        Make sure to copy your API key now. For security reasons, you won&apos;t be able to see it again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                {!generatedKey ? (
                  <Button
                    onClick={generateApiKey}
                    disabled={!newKeyName.trim()}
                  >
                    Generate Key
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button
                      variant={copied ? "default" : "outline"}
                      onClick={handleClose}
                      className="min-w-[80px]"
                    >
                      {copied ? "Done" : "Close"}
                    </Button>
                  </DialogClose>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage your API keys. Keys are used to authenticate your API requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No API keys created yet. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {apiKey.lastUsed 
                          ? new Date(apiKey.lastUsed).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKey(apiKey.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
