import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {Colors} from '../theme/colors';
import {useAuth} from '../features/auth/AuthContext';
import {AuthStatus} from '../features/auth/types';

const SSO_PROVIDERS = [
  {type: 'janrain' as const, label: 'Janrain'},
  {type: 'gigya' as const, label: 'Gigya'},
  {type: 'piano' as const, label: 'Piano'},
  {type: 'auth0' as const, label: 'Auth0'},
] as const;

export const AuthModal: React.FC = () => {
  const {
    status,
    userId,
    error,
    isLoading,
    showAuthModal,
    setShowAuthModal,
    authenticate,
    authenticateWithProvider,
    logout,
  } = useAuth();

  const [providerToken, setProviderToken] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('janrain');
  const isAuthenticated = status === AuthStatus.Authenticated;

  const handleSSOLogin = async () => {
    const success = await authenticate();
    if (success) {
      setShowAuthModal(false);
    }
  };

  const handleProviderLogin = async () => {
    if (!providerToken.trim()) return;
    const success = await authenticateWithProvider(
      {type: selectedProvider} as any,
      providerToken.trim(),
    );
    if (success) {
      setProviderToken('');
      setShowAuthModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowAuthModal(false);
  };

  // ── Render ──

  return (
    <Modal
      visible={showAuthModal}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={() => setShowAuthModal(false)}>
      <View style={styles.container}>
        {/* Header */}
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* ── Status ── */}
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

          {/* ── Error Banner ── */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Authenticated: show logout ── */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Logout</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {/* ── SSO Handshake ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SSO Handshake</Text>
                <Text style={styles.sectionHint}>
                  Start the codeA/codeB exchange with the test user.
                </Text>

                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleSSOLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Login with SSO</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* ── Provider SSO ── */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SSO with Provider</Text>
                <Text style={styles.sectionHint}>
                  Authenticate via a third-party identity provider using a JWT.
                </Text>

                {/* Provider picker */}
                <View style={styles.providerRow}>
                  {SSO_PROVIDERS.map(p => (
                    <TouchableOpacity
                      key={p.type}
                      style={[
                        styles.providerChip,
                        selectedProvider === p.type &&
                          styles.providerChipActive,
                      ]}
                      onPress={() => setSelectedProvider(p.type)}>
                      <Text
                        style={[
                          styles.providerChipText,
                          selectedProvider === p.type &&
                            styles.providerChipTextActive,
                        ]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.tokenInput}
                  placeholder="Paste JWT / token here…"
                  placeholderTextColor={Colors.textMuted}
                  value={providerToken}
                  onChangeText={setProviderToken}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    (!providerToken.trim() || isLoading) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleProviderLogin}
                  disabled={!providerToken.trim() || isLoading}
                  activeOpacity={0.8}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={[styles.buttonText, styles.secondaryText]}>
                      Authenticate
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Info note ── */}
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              SSO Handshake uses a hardcoded test user for POC. Provider SSO
              requires a valid JWT from an identity provider.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Status
  statusCard: {
    padding: 16,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.success,
  },
  dotGuest: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  statusUserId: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Error
  errorBanner: {
    padding: 12,
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    lineHeight: 18,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },

  // Buttons
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.primary,
  },

  // Provider picker
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  providerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  providerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  providerChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  providerChipTextActive: {
    color: Colors.white,
  },

  // Token input
  tokenInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 12,
  },

  // Note
  noteCard: {
    padding: 14,
    backgroundColor: 'rgba(74,144,226,0.06)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
});
