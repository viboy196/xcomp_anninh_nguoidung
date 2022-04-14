import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MediaStream} from 'react-native-webrtc';
import {WebRtcServices} from '../../../services/WebRtcServcies';
export type WebRtcType = {
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  webRtcServices?: WebRtcServices;
};

const initialState = {
  localStream: undefined,
  remoteStream: undefined,
  webRtcServices: undefined,
} as WebRtcType;

export const streamSlice = createSlice({
  name: 'stream',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setLocalStream(state, action: PayloadAction<{stream: MediaStream}>) {
      state = {
        ...state,
        localStream: action.payload.stream,
      };
      return state;
    },
    setRemoteStream(state, action: PayloadAction<{stream: MediaStream}>) {
      state = {
        ...state,
        remoteStream: action.payload.stream,
      };
      return state;
    },
    setWebRtcServices(
      state,
      action: PayloadAction<{webRtcServices: WebRtcServices}>,
    ) {
      state = {
        ...state,
        webRtcServices: action.payload.webRtcServices,
      };
      return state;
    },
    removeStream: state => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(t => t.stop);
        state.localStream.release();
      }
      state = {
        localStream: undefined,
        remoteStream: undefined,
        webRtcServices: undefined,
      };
      return state;
    },
  },
});

export const {
  setLocalStream,
  setRemoteStream,
  removeStream,
  setWebRtcServices,
} = streamSlice.actions;

export default streamSlice.reducer;
