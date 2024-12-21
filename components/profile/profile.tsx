"use client";

// library imports
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();

  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (session?.user?.accessToken) {
      // fetch user profile if access token is available
      // getUserProfile(session.user.accessToken);
    } else {
      // Redirect to `/login` if no access token or no session
      router.push("/signup?mode=login&next=" + pathname);
    }
  }, [session, router, pathname]);

  const getUserProfile = (token: string) => {
    setLoadingProfile(true);
    fetch(`${process.env.AUTH_API_URL}/auth/user_profile`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(() => {
        setLoadingProfile(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error fetching user profile");
        }
      });
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here
  };

  return (
    <>
      {" "}
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
                        <Input id="name" name="name" defaultValue="John Doe" aria-label="Full name" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" defaultValue={session?.user?.email || ""} type="email" aria-label="Email address" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" defaultValue="+1 (555) 000-0000" type="tel" aria-label="Phone number" />
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
                      <AvatarFallback className="AvatarFallback">
                        {(session?.user?.email || "Hoop").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-2xl font-semibold">John Doe</h3>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      <p className="text-sm text-muted-foreground">+1 (555) 000-0000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>Your connected social media accounts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Twitter</Label>
                      <p className="text-sm text-muted-foreground">@johndoe</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" aria-label="Connect Twitter account">
                      Connect
                    </Button>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>GitHub</Label>
                      <p className="text-sm text-muted-foreground">github.com/johndoe</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" aria-label="Connect GitHub account">
                      Connect
                    </Button>
                  </div>
                </CardContent>
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
                      <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked aria-label="Toggle email notifications" />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketing-emails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about new features and updates</p>
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
