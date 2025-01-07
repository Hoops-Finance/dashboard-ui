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

interface ProfileType {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phoneNumber?: string;
  emailVerified?: Date | null;
  oauthAccounts: LinkedAccountType[];
}

export type { UserType, UserResponseType, LinkedAccountType, ProfileType };
