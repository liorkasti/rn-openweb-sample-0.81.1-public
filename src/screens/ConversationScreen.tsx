import React from 'react';
import {StyleSheet, View} from 'react-native';
import {OpenWebConversation} from 'react-native-openweb-sdk';
import type {ConversationScreenProps} from '../navigation/types';

export const ConversationScreen = ({
  navigation,
  route,
}: ConversationScreenProps): React.JSX.Element => {
  const {postId, route: conversationRoute} = route.params;

  return (
    <View style={styles.container}>
      <OpenWebConversation
        postId={postId}
        route={conversationRoute}
        style={styles.conversation}
        onConversationDismissed={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversation: {
    flex: 1,
  },
});
