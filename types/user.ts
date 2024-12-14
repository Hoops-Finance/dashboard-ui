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

type UserResponseType = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  premium_subscription: boolean;
  accessToken: string;
  refreshToken: string;
  sub_id: string;
};

export type { UserType, UserResponseType };
