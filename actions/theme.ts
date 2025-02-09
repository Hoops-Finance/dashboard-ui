"use server";

import { cookies } from "next/headers";

export async function setThemeCookie(theme: "dark" | "light") {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme);
}

export async function getThemeCookie(): Promise<"dark" | "light"> {
  const cookieStore = await cookies();
  return cookieStore.get("theme")?.value === "light" ? "light" : "dark";
}
