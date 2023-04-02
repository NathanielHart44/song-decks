
// ----------------------------------------------------------------------

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUser = null | Record<string, any>;

export type AuthState = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
};

export type JWTContextType = {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser;
  method: 'jwt';
  login: (email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
};

export interface UserMetaData {
  about: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  displayName: string;
  phoneNumber: string | null;
  state: string | null;
  zipCode: string | null;
  picture: string | null;
  cover: string | null;
  handle: string | null;
};


