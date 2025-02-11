// 1) This is your environment variable containing the secret key
//    from reCAPTCHA admin console.
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

/**
 * If user includes `recaptchaToken` in request body or query,
 * we verify that token server-side with Google’s /siteverify endpoint.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  // If for some reason reCAPTCHA is not enabled or no secret is provided,
  // you could skip verification. Otherwise proceed:
  if (!RECAPTCHA_SECRET) {
    console.warn("Missing reCAPTCHA secret in environment; skipping verification.");
    return true;
  }

  // 2) Call Google’s reCAPTCHA endpoint
  const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(verificationURL, {
      method: "POST",
    });
    const data = (await response.json()) as {
      success?: boolean;
      score?: number; // reCAPTCHA v3 returns a score
      action?: string; // reCAPTCHA v3 might return the "action" you set
      "error-codes"?: string[];
    };

    // 3) Check the `data.success` property
    if (!data.success) {
      console.error("reCAPTCHA verification failed:", data["error-codes"]);
      return false;
    }

    // If you’re using reCAPTCHA v3, you can also check the score
    if (typeof data.score === "number") {
      console.log("reCAPTCHA score:", data.score);
      // e.g., if you want a threshold of 0.5 for minimal confidence:
      if (data.score < 0.5) {
        console.warn("reCAPTCHA v3 score below threshold, potential bot.");
        return false;
      }
    }

    // 4) If success = true and optional score is acceptable, pass
    console.log("reCAPTCHA verification successful:", data);
    return true;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  }
}
