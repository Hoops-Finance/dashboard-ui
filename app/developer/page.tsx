"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@/contexts/AuthContext";
import { ClipboardDocumentIcon, KeyIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
// import { auth } from "@/utils/auth";
import { useSession } from "@/utils/auth";
import { ApiKeyEntry, ApiKeyListResponse } from "@/utils/types";

export default function DeveloperPage() {
  //const { session } = useAuth(); // doesn't work because we removed the AuthProviderContext
  //const session = auth() // doesn't work because it's async
  const { data: session, status } = useSession();

  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchKeys = useCallback(async () => {
    // Call our local endpoint which will proxy to the backend
    const res = await fetch(`/api/developer/apikey/list`);
    if (res.ok) {
      const data = (await res.json()) as ApiKeyListResponse;
      setApiKeys(data.keys ?? []);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      void fetchKeys();
    }
  }, [session, fetchKeys]);

  if (status === "loading") {
    return <p>Loading session...</p>;
  }
  if (status === "unauthenticated") {
    return <p>You must be logged in to view Developer Settings.</p>;
  }

  const generateApiKey = async () => {
    setIsCreating(true);
    const res = await fetch(`/api/developer/apikey/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: newKeyName })
    });

    setIsCreating(false);

    if (res.ok) {
      const data = (await res.json()) as { success: boolean; key: string };
      if (!data.key) {
        throw new Error("Failed to generate API key");
      }
      setGeneratedKey(data.key);
      await fetchKeys();
    }
  };

  const copyToClipboard = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <section className="relative pt-16">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Developer Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your API keys and developer settings</p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="API Key Name"
              value={newKeyName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setNewKeyName(e.target.value);
              }}
            />
            <Button
              onClick={() => {
                void generateApiKey();
              }}
              disabled={!newKeyName.trim() || isCreating || !session?.user}
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </div>

        {generatedKey && (
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm break-all">{generatedKey}</code>
              <Button variant="outline" size="icon" onClick={() => void copyToClipboard(generatedKey)} className="h-8 w-8 shrink-0">
                {copied ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Copy this API key now. You won&apos;t be able to see it again.</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys. Keys are used to authenticate your API requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No API keys created yet. Create one to get started.</div>
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
                      <td className="py-2">{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}</td>
                      <td className="text-right py-2">
                        {/* Deletion not implemented */}
                        <Button variant="ghost" size="sm" disabled className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
