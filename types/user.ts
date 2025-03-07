interface LinkedAccountType {
  provider: string;
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  linkedAt: Date;
}

interface UserType {
  id: string;
  name: string;
  email: string;
  avatar: string;
  premiumSubscription: boolean;
  accessToken: string;
  refreshToken: string;
  subId: string;
  emailVerified?: Date | null;
}

interface UserResponseType {
  id: string;
  name: string;
  email: string;
  avatar: string;
  premium_subscription: boolean;
  accessToken: string;
  refreshToken: string;
  sub_id: string;
}

interface SettingUserType {
  emailNotification?: boolean;
  marketingEmails?: boolean;
  securityAlerts?: boolean;
}

interface ProfileType {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phoneNumber?: string;
  emailVerified?: Date | null;
  oauthAccounts: LinkedAccountType[];
  settings?: SettingUserType;
}

export type OAuthProvider = "google" | "discord";

/**
 * The Discord user object from the docs:
 * https://discord.com/developers/docs/resources/user#user-object
 */
export interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: unknown;
}

/**
 * The Google user object from the ID token payload:
 * Common fields from `ticket.getPayload()`
 */
export interface GoogleUserResponse {
  iss?: string;
  azp?: string;
  aud?: string;
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  hd?: string;
  iat?: number;
  exp?: number;
}
export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

// this is google credentials. they aren't actually in the profile linked accounts anyways.
export interface Credentials {
  /**
   * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
   */
  refresh_token?: string | null;
  /**
   * The time in ms at which this token is thought to expire.
   */
  expiry_date?: number | null;
  /**
   * A token that can be sent to a Google API.
   */
  access_token?: string | null;
  /**
   * Identifies the type of token returned. At this time, this field always has the value Bearer.
   */
  token_type?: string | null;
  /**
   * A JWT that contains identity information about the user that is digitally signed by Google.
   */
  id_token?: string | null;
  /**
   * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
   */
  scope?: string;
}
export interface LinkedAccount {
  provider: OAuthProvider;
  providerId: string | Record<string, unknown>;
  providerTokens: Credentials | DiscordTokenResponse;
  linkedAt: Date;
  providerProfile?: DiscordUserResponse | GoogleUserResponse | null;
}

export type { UserType, UserResponseType, LinkedAccountType, ProfileType, SettingUserType };
