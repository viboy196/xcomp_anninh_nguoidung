import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {MediaStream, RTCView} from 'react-native-webrtc';
import {Dimensions} from 'react-native';
type Props = {
  hangup?: () => void;
  remoteStream?: MediaStream;
  localStream?: MediaStream;
};
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export default function Video(props: Props) {
  console.log('localStream', props.localStream?.toURL());
  console.log('remoteStream', props.remoteStream?.toURL());

  const Viewlocal = () => (
    <View>
      <Text> cuộc gọi chưa có người nghe</Text>
      <RTCView
        key={'local'}
        streamURL={props.localStream ? props.localStream.toURL() : ''}
        style={styles.videoFullScreen}
      />
      <TouchableOpacity onPress={props.hangup}>
        ''
        <Text>Tắt</Text>
      </TouchableOpacity>
    </View>
  );
  const ViewRemote = () => (
    <View>
      <RTCView
        key={'remote'}
        streamURL={props.remoteStream ? props.remoteStream.toURL() : ''}
        style={styles.videoFullScreen}
      />
      <RTCView
        key={'local'}
        streamURL={props.localStream ? props.localStream.toURL() : ''}
        style={styles.videoLocal}
      />

      <TouchableOpacity
        onPress={props.hangup}
        style={{
          width: 120,
          height: 60,
          backgroundColor: 'green',
          margin: 3,
          position: 'absolute',
          bottom: 5,
          zIndex: 1000,
          elevation: 1000,
        }}>
        <Text>Tắt</Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View>
      {props.localStream && props.remoteStream ? <ViewRemote /> : <Viewlocal />}
    </View>
  );
}

const styles = StyleSheet.create({
  videoFullScreen: {
    position: 'absolute',
    height: windowHeight,
    width: windowWidth,
    backgroundColor: 'red',
    elevation: -1,
    zIndex: -1,
  },
  videoLocal: {
    position: 'absolute',
    backgroundColor: 'blue',

    right: 0,
    width: 120,
    height: 150,
    elevation: 1000,
    zIndex: 1000,
  },
});
