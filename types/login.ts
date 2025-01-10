interface CredentialsType {
  email: string;
  password: string;
}

interface SocialCredentialsType {
  provider: string;
  code: string;
}

export type { CredentialsType, SocialCredentialsType };
