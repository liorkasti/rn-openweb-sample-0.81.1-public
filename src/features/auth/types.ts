export enum AuthStatus {
  Unknown = 'unknown',
  Guest = 'guest',
  Authenticated = 'authenticated',
}

export interface AuthState {
  status: AuthStatus;
  userId?: string;
  isLoading: boolean;
  error?: string;
}

export const INITIAL_AUTH_STATE: AuthState = {
  status: AuthStatus.Unknown,
  isLoading: false,
};
