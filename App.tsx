import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  TextInput,
  StyleSheet,
  Platform,
  InteractionManager,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {
  OpenWeb,
  type OWArticleSettings,
  type OWAdditionalSettings,
  type OWConversationRoute,
} from 'react-native-openweb-sdk';
import {PreConversation} from './features/PreConversation';
import {Conversation} from './features/Conversation';
import {AuthProvider, AuthModal, useAuth, AuthStatus} from './features/Auth';
// @ts-ignore
import {version as rnVersion} from 'react-native/package.json';

declare const global: {
  __turboModuleProxy?: any;
  nativeFabricUIManager?: any;
};

const getArchitecture = (): string => {
  const isTurboModuleEnabled = global.__turboModuleProxy != null;
  if (Platform.OS === 'ios') {
    return isTurboModuleEnabled ? 'New (Fabric/TurboModules)' : 'Old (Paper)';
  } else if (Platform.OS === 'android') {
    return isTurboModuleEnabled ? 'New (Fabric/TurboModules)' : 'Old (Bridge)';
  }
  return 'Unknown';
};

function AppContent(): React.JSX.Element {
  const [spotId, setSpotId] = useState('sp_eCIlROSD');
  const [postId, setPostId] = useState('sdk1');
  const [sdkReady, setSdkReady] = useState(false);
  const [viewMode, setViewMode] = useState<'pre' | 'full'>('pre');
  const [enableStarRating, setEnableStarRating] = useState(true);
  const [keyboardSegment, setKeyboardSegment] = useState<
    'floating' | 'light' | 'regular'
  >('regular');
  const [conversationRoute, setConversationRoute] = useState<
    OWConversationRoute | undefined
  >(undefined);
  const architecture = getArchitecture();

  // Build articleSettings with correct SDK types
  const articleSettings: OWArticleSettings = {
    additionalSettings: {
      starRating: enableStarRating,
    },
  };

  // Build additionalSettings with correct SDK types
  const commentCreationStyle =
    keyboardSegment === 'floating'
      ? {type: 'floatingKeyboard' as const}
      : keyboardSegment === 'light'
      ? {type: 'light' as const}
      : {type: 'regular' as const};

  const additionalSettings: OWAdditionalSettings = {
    commentCreationSettings: {
      style: commentCreationStyle,
    },
  };

  // Use auth context
  const {status, userId, setShowAuthModal, logout} = useAuth();
  const isAuthenticated = status === AuthStatus.Authenticated;

  useEffect(() => {
    try {
      OpenWeb.manager.setSpotId(spotId);

      // Wait for all interactions to complete before rendering SDK component
      const task = InteractionManager.runAfterInteractions(() => {
        setSdkReady(true);
      });
      return () => task.cancel();
    } catch (e: any) {
      console.error('SDK init failed:', e?.message);
    }
  }, [spotId]);

  // Full Conversation Mode: render full-screen with back button
  if (sdkReady && viewMode === 'full') {
    return (
      <View style={styles.container}>
        <View style={styles.fullConversationHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setConversationRoute(undefined);
              setViewMode('pre');
            }}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.fullConversationTitle}>Conversation</Text>
          <View style={styles.backButton} />
        </View>
        <Conversation
          key={`conv-${postId}-${enableStarRating}-${keyboardSegment}`}
          postId={postId}
          articleSettings={articleSettings}
          additionalSettings={additionalSettings}
          route={conversationRoute}
          onOpenPublisherProfile={(ssoPublisherId, profileType) =>
            console.log(
              '[App] Open publisher profile:',
              ssoPublisherId,
              profileType,
            )
          }
          onConversationDismissed={() => {
            console.log('[App] Conversation dismissed');
            setConversationRoute(undefined);
            setViewMode('pre');
          }}
          onError={error => console.error('[App] Conversation error:', error)}
        />
        <AuthModal />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.label}>React Native</Text>
          <Text style={styles.value}>{rnVersion}</Text>

          <Text style={styles.label}>Architecture</Text>
          <Text style={styles.value}>{architecture}</Text>

          <Text style={styles.label}>SDK Status</Text>
          <Text
            style={[styles.value, {color: sdkReady ? '#10b981' : '#f59e0b'}]}>
            {sdkReady ? 'Ready' : 'Initializing...'}
          </Text>
        </View>

        {/* Configuration Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Spot ID</Text>
          <TextInput
            style={styles.input}
            value={spotId}
            onChangeText={setSpotId}
            placeholder="Enter Spot ID"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Post ID</Text>
          <TextInput
            style={styles.input}
            value={postId}
            onChangeText={setPostId}
            placeholder="Enter Post ID"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Additional Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Enable Star Rating</Text>
            <Switch
              value={enableStarRating}
              onValueChange={setEnableStarRating}
              trackColor={{false: '#d1d5db', true: '#3b82f6'}}
              thumbColor={enableStarRating ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <Text style={styles.label}>Keyboard Segment</Text>
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                keyboardSegment === 'floating' && styles.viewModeButtonActive,
              ]}
              onPress={() => setKeyboardSegment('floating')}>
              <Text
                style={[
                  styles.viewModeText,
                  keyboardSegment === 'floating' && styles.viewModeTextActive,
                ]}>
                Floating
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                keyboardSegment === 'light' && styles.viewModeButtonActive,
              ]}
              onPress={() => setKeyboardSegment('light')}>
              <Text
                style={[
                  styles.viewModeText,
                  keyboardSegment === 'light' && styles.viewModeTextActive,
                ]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                keyboardSegment === 'regular' && styles.viewModeButtonActive,
              ]}
              onPress={() => setKeyboardSegment('regular')}>
              <Text
                style={[
                  styles.viewModeText,
                  keyboardSegment === 'regular' && styles.viewModeTextActive,
                ]}>
                Regular
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Auth Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => (isAuthenticated ? logout() : setShowAuthModal(true))}>
          <Text style={styles.label}>User</Text>
          <Text style={styles.value}>
            {isAuthenticated ? userId || 'Authenticated' : 'Guest'}
          </Text>
          <Text style={styles.link}>
            {isAuthenticated ? 'Tap to logout' : 'Tap to sign in'}
          </Text>
        </TouchableOpacity>

        {/* View Mode Selector */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'pre' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('pre')}>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'pre' && styles.viewModeTextActive,
              ]}>
              Pre-Conversation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === 'full' && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode('full')}>
            <Text
              style={[
                styles.viewModeText,
                viewMode === 'full' && styles.viewModeTextActive,
              ]}>
              Full Conversation
            </Text>
          </TouchableOpacity>
        </View>

        {/* OpenWeb SDK - PreConversation */}
        {sdkReady && viewMode === 'pre' && (
          <PreConversation
            key={`pre-${postId}-${enableStarRating}-${keyboardSegment}`}
            postId={postId}
            articleSettings={articleSettings}
            additionalSettings={additionalSettings}
            onOpenConversationFlow={(route: OWConversationRoute) => {
              console.log('[App] onOpenConversationFlow:', route);
              setConversationRoute(route);
              setViewMode('full');
            }}
            onError={error =>
              console.error('[App] PreConversation error:', error)
            }
          />
        )}
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal />
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  link: {
    fontSize: 13,
    color: '#3b82f6',
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  viewModeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  viewModeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewModeTextActive: {
    color: '#ffffff',
  },
  fullConversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fullConversationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default App;
