import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import {OpenWeb} from 'react-native-openweb-sdk';
import {AuthModal} from '../components/AuthModal';
import {DEFAULT_POST_ID, DEFAULT_SPOT_ID} from '../config/constants';
import {useAuth} from '../features/auth/AuthContext';
import {AuthStatus} from '../features/auth/types';
import type {HomeScreenProps} from '../navigation/types';
import {Colors} from '../theme/colors';

const getArchitecture = (): string => {
  const isTurboModuleEnabled = (global as any).__turboModuleProxy != null;
  if (Platform.OS === 'ios') {
    return isTurboModuleEnabled ? 'New (Fabric/TurboModules)' : 'Old (Paper)';
  } else if (Platform.OS === 'android') {
    return isTurboModuleEnabled ? 'New (Fabric/TurboModules)' : 'Old (Bridge)';
  }
  return 'Unknown';
};

export const HomeScreen = ({
  navigation,
}: HomeScreenProps): React.JSX.Element => {
  const [spotId, setSpotId] = useState(DEFAULT_SPOT_ID);
  const [postId, setPostId] = useState(DEFAULT_POST_ID);
  const [sdkReady, setSdkReady] = useState(false);
  const architecture = getArchitecture();

  const {status, userId, setShowAuthModal, logout} = useAuth();
  const isAuthenticated = status === AuthStatus.Authenticated;

  React.useEffect(() => {
    try {
      OpenWeb.manager.setSpotId(spotId);
      setSdkReady(true);
    } catch (e: any) {
      console.error('SDK init failed:', e?.message);
    }
  }, [spotId]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.label}>Architecture</Text>
          <Text style={styles.value}>{architecture}</Text>

          <Text style={styles.label}>Spot ID</Text>
          <TextInput
            style={styles.input}
            value={spotId}
            onChangeText={setSpotId}
            placeholder="Enter Spot ID"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Post ID</Text>
          <TextInput
            style={styles.input}
            value={postId}
            onChangeText={setPostId}
            placeholder="Enter Post ID"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>SDK</Text>
          <Text
            style={[
              styles.value,
              {color: sdkReady ? Colors.success : Colors.warning},
            ]}>
            {sdkReady ? 'Ready' : 'Not Ready'}
          </Text>
        </View>

        {/* Auth */}
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

        {/* Navigation */}
        <TouchableOpacity
          style={[styles.button, !sdkReady && styles.disabled]}
          disabled={!sdkReady}
          onPress={() =>
            navigation.navigate('PreConversation', {spotId, postId})
          }>
          <Text style={styles.buttonText}>Pre-Conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonAlt,
            !sdkReady && styles.disabled,
          ]}
          disabled={!sdkReady}
          onPress={() => navigation.navigate('Conversation', {postId})}>
          <Text style={styles.buttonText}>Full Conversation</Text>
        </TouchableOpacity>
      </ScrollView>

      <AuthModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    backgroundColor: Colors.background,
  },
  link: {
    fontSize: 13,
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonAlt: {
    backgroundColor: Colors.primaryDark,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disabled: {
    opacity: 0.4,
  },
});
