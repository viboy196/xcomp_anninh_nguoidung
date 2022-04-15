// import React, {useEffect, useRef, useState} from 'react';

// import {Text, View} from 'react-native';
// import {
//   MediaStream,
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
// } from 'react-native-webrtc';
// // import Video from './components/Video';
// import Utils from '../utils';
// import firebase from '@react-native-firebase/app';
// import '@react-native-firebase/firestore';
// import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
// // import Icon from 'react-native-vector-icons/Ionicons';

// // import Video from '../components/Video';
// import {RootStackScreenProps} from '../navigation/types';
// import {useAppDispatch, useAppSelector} from '../redux/store/hooks';
// import {
//   removeStream,
//   setLocalStream,
//   setRemoteStream,
// } from '../redux/features/Webrtc/streamSlices';

// // const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
// const configuration = {
//   iceServers: [
//     {urls: ['stun:hk-turn1.xirsys.com']},
//     {
//       username:
//         'x8w5WLKrzM-Syir6HnFKQFG6y1sobLQpOTkAIM3Lj8xbuPo3UeIQzAQN3Q0HW18AAAAAAGJTyEx2aWJveTE5Ng==',
//       credential: '420db210-b95f-11ec-b5af-0242ac120004',
//       urls: [
//         'turn:hk-turn1.xirsys.com:80?transport=udp',
//         'turn:hk-turn1.xirsys.com:3478?transport=udp',
//         'turn:hk-turn1.xirsys.com:80?transport=tcp',
//         'turn:hk-turn1.xirsys.com:3478?transport=tcp',
//         'turns:hk-turn1.xirsys.com:443?transport=tcp',
//         'turns:hk-turn1.xirsys.com:5349?transport=tcp',
//       ],
//     },
//   ],
// };

// export default function VideoTest({
//   route,
//   navigation,
// }: RootStackScreenProps<'CallWebRtc'>) {
//   // const [localStream, setLocalStream] = useState<MediaStream>();
//   // const [remoteStream, setRemoteStream] = useState<MediaStream>();
//   const dispatch = useAppDispatch();
//   const {localStream} = useAppSelector(state => state.stream);
//   const [status, setStatus] = useState<string>(route.params.status);

//   const pc = useRef<RTCPeerConnection>();
//   const connecting = useRef(false);
//   const cRef =
//     useRef<
//       FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>
//     >();
//   useEffect(() => {
//     if (pc.current) {
//       if (cRef.current) {
//         console.log('vào lắng nghe');
//         cRef.current.onSnapshot(snapShot => {
//           const data = snapShot.data();
//           const answer = data?.answer;
//           if (pc.current && !pc.current.remoteDescription && data && answer) {
//             pc.current.setRemoteDescription(new RTCSessionDescription(answer));
//           }
//         });
//       }
//     }
//   }, []);
//   const setupWebRtc = async () => {
//     pc.current = new RTCPeerConnection(configuration);
//     // lấy luồng stream âm thanh và video
//     const stream = await Utils.getStream();
//     if (stream) {
//       // setLocalStream(stream);
//       dispatch(setLocalStream({stream}));
//       pc.current.addStream(stream);
//     }

//     pc.current.onaddstream = e => {
//       const _e = e as any;
//       const _stream = _e.stream as MediaStream;
//       console.log('onaddstream _stream', _stream.toURL());

//       if (_stream) {
//         dispatch(setRemoteStream({stream: _stream}));
//         // setRemoteStream(_stream);
//       }
//     };
//     // get the remote stream once it is available
//   };

//   const create = async () => {
//     console.log('gọi ....');
//     connecting.current = true;
//     cRef.current = firebase
//       .firestore()
//       .collection('meet')
//       .doc(`chatID_${route.params.roomId}`);
//     // setup webRtc
//     await setupWebRtc();

//     // document for the call
//     // Exchange the ICE candidates between the call and callee
//     collectIceCandidates(cRef.current, 'caller', 'callee');
//     if (pc.current) {
//       // create the offer for the call
//       const offer = (await pc.current.createOffer({})) as RTCSessionDescription;
//       pc.current.setLocalDescription(offer);

//       const cWithOffer = {
//         offer: {
//           type: offer.type,
//           sdp: offer.sdp,
//         },
//       };

//       cRef.current.set(cWithOffer);
//     }
//   };

//   /**
//    * for disconnecting the call close the connection , release the stream
//    * And delete the document for the call
//    */
//   const hangup = async () => {
//     setStatus('');
//     connecting.current = false;

//     if (pc.current) {
//       pc.current.close();
//     }
//     await firestoreCleanUp();
//     streamCleanUp();
//   };

//   const firestoreCleanUp = async () => {
//     cRef.current = firebase
//       .firestore()
//       .collection('meet')
//       .doc(`chatID_${route.params.roomId}`);
//     const calleeCandidate = await cRef.current.collection('callee').get();
//     calleeCandidate.forEach(async candidate => {
//       await candidate.ref.delete();
//     });
//     const callerCandidate = await cRef.current.collection('caller').get();
//     callerCandidate.forEach(async candidate => {
//       await candidate.ref.delete();
//     });
//     cRef.current.delete();
//   };
//   // Helper function
//   const streamCleanUp = () => {
//     if (localStream) {
//       localStream.getTracks().forEach(t => t.stop);
//       localStream.release();
//     }
//     dispatch(removeStream());
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     }
//   };

//   const collectIceCandidates = async (
//     mReft: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>,
//     localName: string,
//     remoteName: string,
//   ) => {
//     const candidateCollection = mReft.collection(localName);
//     if (pc.current) {
//       // lắng nghe sự kiện có stream vào connection

//       // khi có sự kiện icecandidate
//       // thêm môt ice candidate vào firestore

//       pc.current.onicecandidate = event => {
//         const _event = event as any;
//         console.log('on icecandidate ', _event.candidate);
//         if (_event.candidate) {
//           candidateCollection.add(_event.candidate);
//         }
//       };
//       // get candidate to signal
//       mReft.collection(remoteName).onSnapshot(snapshot => {
//         snapshot.docChanges().forEach((change: any) => {
//           console.log('change.type :', change.type, 'remoteName', remoteName);

//           if (change.type === 'added') {
//             const candidate = new RTCIceCandidate(change.doc.data());
//             pc.current?.addIceCandidate(candidate);
//           }
//           if (change.type === 'removed') {
//             hangup();
//           }
//         });
//       });
//     }
//   };
//   if (status === 'call') {
//     setStatus('');
//     create();
//   }
//   // hiển thị màn hình chờ
//   // if (gettingCall) {
//   //   return <GettingCall hangup={hangup} join={join} />;
//   // } else
//   // if (localStream) {
//   //   // hiển thị màn hình call
//   //   return (
//   //     // <Video
//   //     //   hangup={hangup}
//   //     //   localStream={localStream}
//   //     //   remoteStream={remoteStream}
//   //     // />
//   //     <Text>đang gọi</Text>
//   //   );
//   // } else {
//   //   // còn lại hiển thị nút gọi
//   //   return (
//   //     <View>
//   //       <View style={{flexDirection: 'row'}}>
//   //         <TouchableOpacity onPress={create} style={styles.button}>
//   //           <Text>gọi</Text>
//   //         </TouchableOpacity>
//   //       </View>

//   //       <View
//   //         style={{
//   //           width: 100,
//   //         }}></View>
//   //     </View>
//   //   );
//   // }
//   //hiện thị cuộc gọi
//   if (localStream) {
//     return <Text> đang có cuộc gọi</Text>;
//   } else {
//     return <View />;
//   }
// }
