import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {
  removeStream,
  setLocalStream,
  setRemoteStream,
} from '../redux/features/Webrtc/streamSlices';
import Utils from '../utils';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';
const configuration = {
  iceServers: [
    {urls: ['stun:hk-turn1.xirsys.com']},
    {
      username:
        'x8w5WLKrzM-Syir6HnFKQFG6y1sobLQpOTkAIM3Lj8xbuPo3UeIQzAQN3Q0HW18AAAAAAGJTyEx2aWJveTE5Ng==',
      credential: '420db210-b95f-11ec-b5af-0242ac120004',
      urls: [
        'turn:hk-turn1.xirsys.com:80?transport=udp',
        'turn:hk-turn1.xirsys.com:3478?transport=udp',
        'turn:hk-turn1.xirsys.com:80?transport=tcp',
        'turn:hk-turn1.xirsys.com:3478?transport=tcp',
        'turns:hk-turn1.xirsys.com:443?transport=tcp',
        'turns:hk-turn1.xirsys.com:5349?transport=tcp',
      ],
    },
  ],
};
export class WebRtcServices {
  static instead: WebRtcServices;
  #pc: RTCPeerConnection;
  #roomId: string;
  #dispatch: any;
  #cRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
  constructor(input: {dispatch: any; roomId: string}) {
    this.#dispatch = input.dispatch;
    this.#roomId = input.roomId;
    this.#pc = new RTCPeerConnection(configuration);
    this.#cRef = firebase
      .firestore()
      .collection('meet')
      .doc(`chatID_${this.#roomId}`);

    WebRtcServices.instead = this;
  }

  #setupWebRtc = async () => {
    // lấy luồng stream âm thanh và video
    const stream = await Utils.getStream();
    if (stream) {
      // setLocalStream(stream);
      WebRtcServices.instead.#dispatch(setLocalStream({stream}));
      WebRtcServices.instead.#pc.addStream(stream);
    }
    WebRtcServices.instead.#pc.onaddstream = e => {
      const _e = e as any;
      const _stream = _e.stream as MediaStream;
      console.log('onaddstream _stream', _stream.toURL());

      if (_stream) {
        WebRtcServices.instead.#dispatch(setRemoteStream({stream: _stream}));
        // setRemoteStream(_stream);
      }
    };
  };
  create = async () => {
    console.log('gọi ....');
    await WebRtcServices.instead.#setupWebRtc();
    await WebRtcServices.instead.#collectIceCandidates(
      WebRtcServices.instead.#cRef,
      'caller',
      'callee',
    );
    if (WebRtcServices.instead.#pc) {
      // create the offer for the call
      const offer = (await WebRtcServices.instead.#pc.createOffer(
        {},
      )) as RTCSessionDescription;
      WebRtcServices.instead.#pc.setLocalDescription(offer);

      const cWithOffer = {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
      };

      WebRtcServices.instead.#cRef.set(cWithOffer);
    }
  };

  #collectIceCandidates = async (
    mReft: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>,
    localName: string,
    remoteName: string,
  ) => {
    const candidateCollection = mReft.collection(localName);
    if (WebRtcServices.instead.#pc) {
      // lắng nghe sự kiện có stream vào connection

      // khi có sự kiện icecandidate
      // thêm môt ice candidate vào firestore

      WebRtcServices.instead.#pc.onicecandidate = event => {
        const _event = event as any;
        console.log('on icecandidate ', _event.candidate);
        if (_event.candidate) {
          candidateCollection.add(_event.candidate);
        }
      };
      mReft.onSnapshot(snapShot => {
        const data = snapShot.data();
        const answer = data?.answer;
        if (
          WebRtcServices.instead.#pc &&
          !WebRtcServices.instead.#pc.remoteDescription &&
          data &&
          answer
        ) {
          WebRtcServices.instead.#pc.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
        }
      });
      // get candidate to signal
      mReft.collection(remoteName).onSnapshot(snapshot => {
        snapshot.docChanges().forEach((change: any) => {
          console.log('change.type :', change.type, 'remoteName', remoteName);

          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            this.#pc.addIceCandidate(candidate);
          }
          if (change.type === 'removed') {
            this.hangup();
          }
        });
      });
    }
  };
  hangup = async () => {
    if (WebRtcServices.instead.#pc) {
      WebRtcServices.instead.#pc.close();
    }
    await WebRtcServices.instead.#firestoreCleanUp();
    WebRtcServices.instead.#dispatch(removeStream());
    WebRtcServices.instead.#dispatch(removeStream());
  };
  #firestoreCleanUp = async () => {
    const calleeCandidate = await WebRtcServices.instead.#cRef
      .collection('callee')
      .get();
    calleeCandidate.forEach(async candidate => {
      await candidate.ref.delete();
    });
    const callerCandidate = await WebRtcServices.instead.#cRef
      .collection('caller')
      .get();
    callerCandidate.forEach(async candidate => {
      await candidate.ref.delete();
    });
    WebRtcServices.instead.#cRef.delete();
  };
}
