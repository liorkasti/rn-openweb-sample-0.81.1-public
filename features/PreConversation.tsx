import React from 'react';
import {View, StyleSheet} from 'react-native';
import {
  OpenWebPreConversation,
  type OWArticleSettings,
  type OWAdditionalSettings,
  type OWConversationRoute,
} from 'react-native-openweb-sdk';

// TODO: Import from SDK once exported in v1.0.1
type OWErrorHandler = (error: any) => void;

interface PreConversationProps {
  postId: string;
  articleSettings?: OWArticleSettings;
  additionalSettings?: OWAdditionalSettings;
  onOpenConversationFlow?: (route: OWConversationRoute) => void;
  onError?: OWErrorHandler;
}

export const PreConversation: React.FC<PreConversationProps> = ({
  postId,
  articleSettings,
  additionalSettings,
  onOpenConversationFlow,
  onError,
}) => {
  return (
    <View style={styles.container}>
      <OpenWebPreConversation
        postId={postId}
        articleSettings={articleSettings}
        additionalSettings={additionalSettings}
        onOpenConversationFlow={onOpenConversationFlow}
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
