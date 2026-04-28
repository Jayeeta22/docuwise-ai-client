export type AuthPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
};
