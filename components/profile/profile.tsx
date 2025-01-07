"use client";

// library imports
import { useState, useEffect, FormEvent, useCallback } from "react";
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
import { ProfileType } from "@/types/user.ts";

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profile, setProfile] = useState<ProfileType>();
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    const res = await fetch(`/api/auth/profile/one`);
    if (res.ok) {
      setLoadingProfile(false);
      const data = await res.json();
      setProfile(data || {});
    }
  }, []);

  useEffect(() => {
    if (session?.user.accessToken) {
      // fetch user profile if access token is available
      fetchProfile();
    } else {
      // Redirect to `/login` if no access token or no session
      router.push("/signup?mode=login&next=" + pathname);
    }
  }, [session, router, pathname, fetchProfile]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Handle image conversion to base64
    const imageFile = formData.get('avatar') as File;
    if (imageFile && imageFile.size > 0) {
      const base64Image = await convertToBase64(imageFile);
      formData.delete('avatar');
      formData.append('avatar', base64Image);
    }

    updateProfile(formData);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const updateProfile = async (formData: FormData) => {
    setIsUpdating(true);
    const jsonData = Object.fromEntries(formData.entries());

    const res = await fetch(`/api/auth/profile/update`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(jsonData)
    });

    setIsUpdating(false);

    if (res.ok) {
      const data = await res.json();
      await fetchProfile();
    }
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
                        <Label htmlFor="avatar">Profile Picture</Label>
                        <Input id="avatar" name="avatar" type="file" accept="image/*" className="cursor-pointer" aria-label="Profile picture" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={profile?.name || ""} aria-label="Full name" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Phone</Label>
                        <Input id="phoneNumber" name="phoneNumber" defaultValue={profile?.phoneNumber || ""} type="tel" aria-label="Phone number" />
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
                      <AvatarImage src={profile?.avatar || "/images/avatar-test.png"} alt="Profile picture" className="object-cover" />
                      <AvatarFallback className="AvatarFallback">
                        {(session?.user?.email || "Hoop").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-2xl font-semibold">{ profile?.name || 'Jhon Doe' }</h3>
                      <p className="text-sm text-muted-foreground">{ profile?.email || 'email@example.com' }</p>
                      <p className="text-sm text-muted-foreground">{ profile?.phoneNumber || '+1 (555) 000-0000' }</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Accounts</CardTitle>
                  <CardDescription>Your linked accounts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.oauthAccounts?.map((oauthAccount) => (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <Label>{oauthAccount.provider}</Label>
                          <p className="text-sm text-muted-foreground">
                            since {new Date(oauthAccount.linkedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </>
                  ))}
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
