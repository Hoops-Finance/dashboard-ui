"use server";

import { signOut } from "@/utils/auth";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await signOut();
  redirect("/");
}
