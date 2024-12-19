"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { ClipboardDocumentIcon, KeyIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

export default function DeveloperPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const fetchKeys = useCallback(async () => {
    if (!session?.user?.accessToken) return;
    const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/list`, {
      headers: {
        "x-api-key": `${process.env.AUTH_API_KEY}`,
        "Authorization": `Bearer ${session.user.accessToken}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      setApiKeys(data.keys || []);
    }
  }, [session]);

  useEffect(() => {
    fetchKeys();
  }, [session, fetchKeys]);

 

  const generateApiKey = async () => {
    if (!session?.user?.accessToken) return;
    setIsCreating(true);
    const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/create`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${process.env.AUTH_API_KEY}`,
        "Authorization": `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify({ name: newKeyName })
    });

    setIsCreating(false);

    if (res.ok) {
      const data = await res.json();
      setGeneratedKey(data.apiKey);
      await fetchKeys();
    }
  };

  const copyToClipboard = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

          <div className="flex items-center gap-2">
            <Input
              placeholder="API Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={generateApiKey} disabled={!newKeyName.trim() || isCreating}>
              <KeyIcon className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </div>

        {generatedKey && (
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
            <p className="text-xs text-muted-foreground mt-2">Copy this API key now. You won&apos;t be able to see it again.</p>
          </div>
        )}

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
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Created</th>
                    <th className="text-left py-2">Last used</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.key}>
                      <td className="font-medium py-2">{apiKey.name}</td>
                      <td className="py-2">{new Date(apiKey.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        {apiKey.lastUsed 
                          ? new Date(apiKey.lastUsed).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="text-right py-2">
                        {/* Deletion not implemented */}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
