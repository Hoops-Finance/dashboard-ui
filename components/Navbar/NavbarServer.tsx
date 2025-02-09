"use server";
import { auth } from "@/utils/auth";
import { logoutAction } from "@/actions/logout";
import NavbarClient from "../Navbar";

export default async function Navbar() {
  const session = await auth();
  return (
    <NavbarClient 
      sessionFromServer={session}
      logoutAction={logoutAction}
    />
  );
}
