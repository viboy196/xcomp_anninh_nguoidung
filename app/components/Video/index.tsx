import {StyleSheet} from 'react-native';
import React, {useCallback} from 'react';
import {RTCView} from 'react-native-webrtc';
import Button from '../items/Button';
import {View} from '../Themed';
import {useAppSelector} from '../../redux/store/hooks';
import {RootStackScreenProps} from '../../navigation/types';
// import {Dimensions} from 'react-native';
// type Props = {
//   hangup: () => void;
//   remoteStream?: MediaStream;
//   localStream: MediaStream;
// };

function ButtonContainer(props: {hangup: () => void}) {
  return (
    <View style={styles.bContainer}>
      <Button iconName="phone" BackgroundColor="red" onPress={props.hangup} />
    </View>
  );
}
export default function Video({
  navigation,
}: RootStackScreenProps<'CallWebRtc'>) {
  const {localStream, remoteStream, webRtcServices} = useAppSelector(
    state => state.stream,
  );

  console.log('localStream', localStream?.toURL());
  console.log('remoteStream', remoteStream?.toURL());
  // }, [props.remoteStream]);
  const hangup = useCallback(async () => {
    await webRtcServices?.hangup();

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, webRtcServices]);

  if (localStream && remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={localStream.toURL()}
          objectFit={'cover'}
          style={styles.videoLocal}
        />
        <RTCView
          streamURL={remoteStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />

        <ButtonContainer hangup={hangup} />
      </View>
    );
  } else if (localStream && !remoteStream) {
    return (
      <View style={styles.container}>
        <RTCView
          streamURL={localStream.toURL()}
          objectFit={'cover'}
          style={styles.video}
        />
        <ButtonContainer hangup={hangup} />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <ButtonContainer hangup={hangup} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bContainer: {flexDirection: 'row', bottom: 30},
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  videoLocal: {
    position: 'absolute',
    width: 100,
    height: 150,
    top: 0,
    left: 20,
    elevation: 10,
  },
});
