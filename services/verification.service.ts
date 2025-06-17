/**
 * Service for handling email verification
 */

/**
 * Verify email with verification code
 * @param email User's email address
 * @param code Verification code sent to the user's email
 * @returns Promise with verification result
 */
export async function verifyEmailService({ email, code }: { email: string; code: string }) {
  try {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Verification] POST /api/auth/verify-email failed:", res.status, errorText);
      return { 
        success: false, 
        error: "Failed to verify email",
        message: errorText
      };
    }
    
    const data = await res.json();
    return { 
      success: true,
      ...data
    };
  } catch (err) {
    console.error("[Verification] Error verifying email:", err);
    return { 
      success: false, 
      error: "An error occurred during verification" 
    };
  }
}
