import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OWConversationRoute} from 'react-native-openweb-sdk';

export type RootStackParamList = {
  Home: undefined;
  PreConversation: {spotId: string; postId: string};
  Conversation: {postId: string; route?: OWConversationRoute};
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export type PreConversationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PreConversation'
>;

export type ConversationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Conversation'
>;
