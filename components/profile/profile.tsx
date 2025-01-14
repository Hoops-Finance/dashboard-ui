"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user.accessToken) {
      setLoadingProfile(true);
      fetchUserProfile();
    } else {
      router.push("/signup?mode=login&next=" + pathname);
    }
  }, [session, status, router, pathname]);

  async function fetchUserProfile() {
    try {
      const res = await fetch("/api/auth/profile");
      if (!res.ok) {
        console.error("[Profile] GET /api/auth/profile call failed:", res.status, await res.text());
        setLoadingProfile(false);
        return;
      }
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error("[Profile] Error fetching user profile via /api/auth/profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  function linkAccount(provider: string) {
    if (!session?.user?.accessToken) {
      console.error("[Profile] No session token found, can't link account");
      return;
    }
    window.location.href = `/api/auth/oauth/start?provider=${provider}&state=${encodeURIComponent(session.user.accessToken)}`;
  }

  function renderLinkedAccounts() {
    if (!profileData || !Array.isArray(profileData.linkedAccounts)) return null;

    // Determine if user has Google or Discord
    const hasGoogle = profileData.linkedAccounts.some((acct: any) => acct.provider === "google");
    const hasDiscord = profileData.linkedAccounts.some((acct: any) => acct.provider === "discord");

    // If none linked, show both buttons
    if (profileData.linkedAccounts.length === 0) {
      return (
        <div className="mt-4">
          <p className="text-muted-foreground text-sm mb-2">No social accounts linked.</p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => linkAccount("google")}>
              Link Google
            </Button>
            <Button variant="outline" size="sm" onClick={() => linkAccount("discord")}>
              Link Discord
            </Button>
          </div>
        </div>
      );
    }

    // Some linked => show them, plus link button(s) for what's missing
    return (
      <div className="mt-4 space-y-2">
        {profileData.linkedAccounts.map((acct: any, idx: number) => (
          <div key={idx} className="flex items-center space-x-3">
            <p className="text-sm font-medium capitalize">{acct.provider}</p>
            <p className="text-xs text-muted-foreground">
              {JSON.stringify(acct.providerProfile)}
            </p>
          </div>
        ))}

        {/* If user only has google => show “Link Discord”, etc. */}
        <div className="flex space-x-2 pt-2">
          {!hasGoogle && (
            <Button variant="outline" size="sm" onClick={() => linkAccount("google")}>
              Link Google
            </Button>
          )}
          {!hasDiscord && (
            <Button variant="outline" size="sm" onClick={() => linkAccount("discord")}>
              Link Discord
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {loadingProfile ? (
        <p>Loading...</p>
      ) : (
        <section className="relative pt-16">
          <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>Make changes to your profile information here.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          // If the backend sets top-level name, use it. Fallback to "Anon".
                          defaultValue={profileData?.name || "Anon"}
                          aria-label="Full name"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          defaultValue={profileData?.email || session?.user.email || ""}
                          type="email"
                          aria-label="Email address"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        // we don't collect this yet
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          defaultValue="+1 (555) 000-0000"
                          type="tel"
                          aria-label="Phone number"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your personal profile information and photo.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Avatar className="h-24 w-24">
                      {/* If avatar from backend is present, use it. Otherwise fallback. */}
                      {profileData?.avatar ? (
                        <AvatarImage src={profileData.avatar} alt="User avatar" />
                      ) : (
                        <AvatarFallback className="AvatarFallback">
                          {(profileData?.email ?? session?.user.email ?? "H")[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-2xl font-semibold">
                        {profileData?.name ||
                          profileData?.emails?.[0]?.email ||
                          session?.user.email ||
                          "John Doe"}
                      </h3>
                      {/* Display multiple emails if present */}
                      {profileData?.emails && profileData.emails.length > 1 && (
                        <ul className="text-sm text-muted-foreground">
                          {profileData.emails.map((em: any, i: number) => (
                            <li key={i}>
                              {em.email} {em.primary ? "(primary)" : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Accounts Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Accounts</CardTitle>
                  <CardDescription>Manage linked social media or OAuth providers.</CardDescription>
                </CardHeader>
                <CardContent>{renderLinkedAccounts()}</CardContent>
              </Card>

              {/* Notifications Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked aria-label="Toggle email notifications" />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and updates
                      </p>
                    </div>
                    <Switch id="marketing-emails" aria-label="Toggle marketing emails" />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about security updates</p>
                    </div>
                    <Switch id="security-alerts" defaultChecked aria-label="Toggle security alerts" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
