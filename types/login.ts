type CredentialsType = {
  email: string;
  password: string;
};

type SocialCredentialsType = {
  provider: string;
  code: string;
};

export type { CredentialsType, SocialCredentialsType };
