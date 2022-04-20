import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {Text, View} from '../../components/Themed';
import {useAppDispatch, useAppSelector} from '../../redux/store/hooks';
import {RootTabScreenProps} from '../../navigation/types';
//import axios, { urlDetail } from "../../utils/api/apiLink";
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import TienIch from '../../components/TienIch';
import {tintColorLight} from '../../constants/Colors';
import ApiRequest from '../../utils/api/Main/ApiRequest';
import {logOut} from '../../redux/features/auth/authSlices';
import {WebRtcServices} from '../../services/WebRTCService1';
export default function TabOneScreen({}: RootTabScreenProps<'TabOne'>) {
  // const tag = 'TabOneScreen';
  const {token} = useAppSelector(state => state.auth);
  const [detailUser, setDetailUser] = useState<any>({});
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (token) {
      ApiRequest.DetailInfoNguoiDung(token)
        .then(data => {
          setDetailUser(data.result);
        })
        .catch(() => {
          dispatch(logOut());
        });
    }
  }, [dispatch, token]);
  const openWebRtc = useCallback(async (roomId: string) => {
    const _webRtcService = new WebRtcServices({
      roomId,
    });
    await _webRtcService.create();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.headerView}>
        <Text style={styles.titleText}>{detailUser.name}</Text>
        <View style={styles.empty} />
        <TouchableOpacity>
          <FontAwesome5Icon
            name={'bars'}
            size={25}
            color={tintColorLight}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{marginRight: 15}}
          />
        </TouchableOpacity>
      </View>
      <TienIch openWebRtc={openWebRtc} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerView: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  titleText: {
    marginLeft: 20,
    fontSize: 24,
  },
  empty: {
    flex: 1,
  },
});
