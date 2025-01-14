export async function updateProfileService(jsonData: object) {
  try {
    const res = await fetch("/api/auth/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    });
    if (!res.ok) {
      console.error("[Profile] POST /api/auth/profile/update failed:", res.status, await res.text());
      return { ok: false, error: "Failed to update profile" };
    }
  } catch (err) {
    console.error("[Profile] Error updating user profile:", err);
  }
}
