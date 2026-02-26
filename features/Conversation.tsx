import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  OpenWebConversation,
  type OWArticleSettings,
  type OWAdditionalSettings,
  type OWConversationRoute,
  type OWUserProfileType,
  OWErrorHandler,
} from 'react-native-openweb-sdk';

interface ConversationProps {
  postId: string;
  articleSettings?: OWArticleSettings;
  additionalSettings?: OWAdditionalSettings;
  route?: OWConversationRoute;
  onOpenPublisherProfile?: (
    ssoPublisherId: string,
    profileType: OWUserProfileType,
  ) => void;
  onConversationDismissed?: () => void;
  onError?: OWErrorHandler;
}

export const Conversation: React.FC<ConversationProps> = ({
  postId,
  articleSettings,
  additionalSettings,
  route,
  onOpenPublisherProfile,
  onConversationDismissed,
  onError,
}) => {
  return (
    <View style={styles.container}>
      <OpenWebConversation
        style={{flex: 1}}
        postId={postId}
        articleSettings={articleSettings}
        additionalSettings={additionalSettings}
        route={route}
        onOpenPublisherProfile={onOpenPublisherProfile}
        onConversationDismissed={onConversationDismissed}
        onError={onError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
