import React, {useEffect, useState} from 'react';
import {ScrollView, Text} from 'react-native';
import {OpenWeb, OpenWebPreConversation} from 'react-native-openweb-sdk';
// @ts-ignore
import {version as rnVersion} from 'react-native/package.json';

function App(): React.JSX.Element {
  const [spotId] = useState('sp_eCIlROSD');
  const [postId] = useState('sdk1');
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    console.log('🔧 Initializing OpenWeb SDK...');
    console.log('spotId:', spotId);
    console.log('postId:', postId);
    try {
      OpenWeb.manager.setSpotId(spotId);
      setSdkReady(true);
      console.log('✅ SDK initialized successfully');
    } catch (e: any) {
      console.error('❌ SDK init failed:', e?.message, e);
    }
  }, [spotId]);

  console.log('🎨 Rendering App - sdkReady:', sdkReady);

  return (
    <>
      <Text style={{padding: 10, paddingTop: 60, fontSize: 12, fontWeight: 'bold', color: '#666'}}>
        RN Version: {rnVersion} | Architecture: {(global as any).nativeFabricUIManager != null ? 'New (Fabric)' : 'Old (Paper)'}
      </Text>
      <Text style={{padding: 10, fontSize: 12, color: sdkReady ? 'green' : 'red'}}>
        SDK Status: {sdkReady ? '✅ Ready' : '❌ Not Ready'}
      </Text>
      <ScrollView>
        <OpenWebPreConversation
          postId={postId}
          style={{minHeight: 400}}
        />
      </ScrollView>
    </>
  );
}

export default App;
