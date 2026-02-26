import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import type {OWSSOProvider} from 'react-native-openweb-sdk';
import {AuthStatus, INITIAL_AUTH_STATE} from './types';
import type {AuthState} from './types';
import {authService, exchangeCodeAForCodeB} from './services/OpenWebAuth';

export interface AuthContextValue extends AuthState {
  authenticate: () => Promise<boolean>;
  authenticateWithProvider: (
    provider: OWSSOProvider,
    token: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>(INITIAL_AUTH_STATE);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const completionRef = useRef<(() => void) | null>(null);

  const completeAuthFlow = () => {
    completionRef.current?.();
    completionRef.current = null;
  };

  const dismissAuthModal = (show: boolean) => {
    setShowAuthModal(show);
    if (!show) completeAuthFlow();
  };

  const authenticate = async (): Promise<boolean> => {
    setState(prev => ({...prev, isLoading: true, error: undefined}));
    try {
      const codeA = await authService.startSSO();
      const codeB = await exchangeCodeAForCodeB(codeA);
      const userId = await authService.completeSSO(codeB);
      setState({status: AuthStatus.Authenticated, userId, isLoading: false});
      completeAuthFlow();
      return true;
    } catch (e: any) {
      console.error('[AuthContext]', e?.message);
      setState(prev => ({...prev, isLoading: false, error: e?.message}));
      return false;
    }
  };

  const authenticateWithProvider = async (
    provider: OWSSOProvider,
    token: string,
  ): Promise<boolean> => {
    setState(prev => ({...prev, isLoading: true, error: undefined}));
    try {
      const userId = await authService.ssoUsingProvider(provider, token);
      setState({status: AuthStatus.Authenticated, userId, isLoading: false});
      completeAuthFlow();
      return true;
    } catch (e: any) {
      console.error('[AuthContext]', e?.message);
      setState(prev => ({...prev, isLoading: false, error: e?.message}));
      return false;
    }
  };

  const logout = async () => {
    setState(prev => ({...prev, isLoading: true}));
    try {
      await authService.logout();
      setState({status: AuthStatus.Guest, isLoading: false});
    } catch (e: any) {
      console.error('[AuthContext] Logout:', e?.message);
      setState(prev => ({...prev, isLoading: false}));
    }
  };

  useEffect(() => {
    const unsubAuth = authService.onDisplayAuthenticationFlow(completion => {
      completionRef.current = completion;
      setShowAuthModal(true);
    });

    const unsubRenew = authService.onRenewSSO(async (_userId, completion) => {
      try {
        const codeA = await authService.startSSO();
        const codeB = await exchangeCodeAForCodeB(codeA);
        await authService.completeSSO(codeB);
      } catch (e) {
        console.error('[AuthContext] SSO renewal failed:', e);
      }
      completion();
    });

    authService.shouldDisplayLoginPrompt = true;
    authService.getUserStatus().then(setState);

    return () => {
      unsubAuth();
      unsubRenew();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        authenticate,
        authenticateWithProvider,
        logout,
        showAuthModal,
        setShowAuthModal: dismissAuthModal,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
