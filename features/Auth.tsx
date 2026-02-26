import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {OpenWeb} from 'react-native-openweb-sdk';
import type {OWSSOProvider} from 'react-native-openweb-sdk';

// ═══════════════════════════════════════════════════════════
// Auth Types
// ═══════════════════════════════════════════════════════════

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

const INITIAL_AUTH_STATE: AuthState = {
  status: AuthStatus.Unknown,
  isLoading: false,
};

// ═══════════════════════════════════════════════════════════
// Auth Service
// ═══════════════════════════════════════════════════════════

const TAG = '[AuthService]';

class AuthService {
  private get auth() {
    return OpenWeb.manager.authentication;
  }

  async startSSO(): Promise<string> {
    console.log(TAG, 'Starting SSO → generating codeA…');
    const codeA = await this.auth.startSSO();
    console.log(TAG, 'codeA:', codeA);
    return codeA;
  }

  async completeSSO(codeB: string): Promise<string> {
    console.log(TAG, 'Completing SSO with codeB…');
    const userId = await this.auth.completeSSO(codeB);
    console.log(TAG, 'SSO done. userId:', userId);
    return userId;
  }

  async ssoUsingProvider(
    provider: OWSSOProvider,
    token: string,
  ): Promise<string> {
    console.log(TAG, 'SSO via provider:', provider.type);
    const userId = await this.auth.ssoUsingProvider(provider, token);
    console.log(TAG, 'Provider SSO done. userId:', userId);
    return userId;
  }

  async getUserStatus(): Promise<AuthState> {
    try {
      const status = await this.auth.getUserStatus();
      switch (status.type) {
        case 'ssoLoggedIn':
          return {
            status: AuthStatus.Authenticated,
            userId: status.userId,
            isLoading: false,
          };
        case 'guest':
          return {status: AuthStatus.Guest, isLoading: false};
        default:
          return {status: AuthStatus.Unknown, isLoading: false};
      }
    } catch (error: any) {
      console.warn(TAG, 'getUserStatus error:', error?.message);
      return {status: AuthStatus.Unknown, isLoading: false};
    }
  }

  async logout(): Promise<void> {
    console.log(TAG, 'Logging out…');
    await this.auth.logout();
    console.log(TAG, 'Logged out');
  }

  onRenewSSO(handler: (userId: string, completion: () => void) => void) {
    return this.auth.onRenewSSO(handler);
  }

  onDisplayAuthenticationFlow(handler: (completion: () => void) => void) {
    return this.auth.onDisplayAuthenticationFlow(handler);
  }

  set shouldDisplayLoginPrompt(value: boolean) {
    this.auth.shouldDisplayLoginPrompt = value;
  }

  get shouldDisplayLoginPrompt(): boolean {
    return this.auth.shouldDisplayLoginPrompt;
  }
}

const authService = new AuthService();

// SSO API Configuration
const SSO_API_BASE = 'https://www.spot.im/api/sso/v1/register-user';
const ACCESS_TOKEN = '03190715DchJcY';
const TEST_USER = {
  primaryKey: 'u_mfs01DpWfsXp',
  userName: 'Test-User',
};

const exchangeCodeAForCodeB = async (codeA: string): Promise<string> => {
  const url =
    `${SSO_API_BASE}?code_a=${encodeURIComponent(codeA)}` +
    `&access_token=${encodeURIComponent(ACCESS_TOKEN)}` +
    `&primary_key=${encodeURIComponent(TEST_USER.primaryKey)}` +
    `&user_name=${encodeURIComponent(TEST_USER.userName)}`;

  console.log(TAG, '[SSO API] Exchanging codeA for:', TEST_USER.userName);

  const response = await fetch(url);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(TAG, '[SSO API] Error:', response.status, errorBody);
    throw new Error(`SSO API error ${response.status}: ${errorBody}`);
  }

  const codeB = await response.text();
  console.log(TAG, '[SSO API] Got codeB:', codeB.substring(0, 20) + '…');
  return codeB;
};

// ═══════════════════════════════════════════════════════════
// Auth Context
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// Auth Modal Component
// ═══════════════════════════════════════════════════════════

export const AuthModal: React.FC = () => {
  const {
    status,
    userId,
    error,
    isLoading,
    showAuthModal,
    setShowAuthModal,
    authenticate,
    logout,
  } = useAuth();

  const isAuthenticated = status === AuthStatus.Authenticated;

  const handleSSOLogin = async () => {
    const success = await authenticate();
    if (success) {
      setShowAuthModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowAuthModal(false);
  };

  return (
    <Modal
      visible={showAuthModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAuthModal(false)}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Authentication</Text>
          <TouchableOpacity
            onPress={() => setShowAuthModal(false)}
            style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  isAuthenticated ? styles.dotAuth : styles.dotGuest,
                ]}
              />
              <Text style={styles.statusText}>
                {isAuthenticated ? 'Authenticated' : 'Guest'}
              </Text>
            </View>
            {userId && <Text style={styles.statusUserId}>{userId}</Text>}
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isAuthenticated ? (
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Logout</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SSO Handshake</Text>
              <Text style={styles.sectionHint}>
                Start the codeA/codeB exchange with the test user.
              </Text>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSSOLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Login with SSO</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              SSO Handshake uses a hardcoded test user for POC.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dotAuth: {
    backgroundColor: '#10b981',
  },
  dotGuest: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  statusUserId: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  errorBanner: {
    padding: 12,
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteCard: {
    padding: 14,
    backgroundColor: 'rgba(74,144,226,0.06)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 17,
  },
});
