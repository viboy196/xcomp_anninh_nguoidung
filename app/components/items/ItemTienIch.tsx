import React, {useCallback, useEffect, useState} from 'react';
import {Text, View} from '../Themed';

import {Alert, StyleSheet, TouchableOpacity, Vibration} from 'react-native';
import {useAppSelector} from '../../redux/store/hooks';
import ApiRequest from '../../utils/api/Main/ApiRequest';
import uuid from 'react-native-uuid';

import SystemSetting from 'react-native-system-setting';
import {KeyServices} from '../../services/KeyServices';
type Props = {
  ItemTienIch?: any;
  openWebRtc: (roomId: string) => void;
};

class StateSend {
  static roomId = '';

  static roomIdSend = '';
}

const ItemTienIch = (props: Props) => {
  const data = props.ItemTienIch;

  console.log('loaiTienIch', data.loaiTienIch);
  const {token, stateToken} = useAppSelector(state => state.auth);

  useEffect(() => {
    const volumeListener = SystemSetting.addVolumeListener(_data => {
      if (KeyServices.on) {
        KeyServices.numkey += 1;
      }
      console.log('KeyServices.numkey', KeyServices.numkey);
      if (KeyServices.numkey > 5) {
        Vibration.vibrate();
        StateSend.roomId = uuid.v4() as string;
        StateSend.roomIdSend = JSON.stringify({
          roomId: StateSend.roomId,
          stateToken,
        });
        sendNoti();
        props.openWebRtc(StateSend.roomId);
        KeyServices.numkey = 0;
        KeyServices.on = false;
        Alert.alert('đã gọi trợ giúp');
      }
    });
    return () => {
      SystemSetting.removeVolumeListener(volumeListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);
  const sendNoti = useCallback(() => {
    if (data.id && token) {
      ApiRequest.SendNotiSoS({
        idti: data.id,
        token: token,
        info: StateSend.roomIdSend,
      }).then(res => {
        console.log('SendNotiSoS', res);
      });
    }
  }, [data.id, token]);
  const [qrLayOut, setQrLayout] = useState(false);
  return (
    <View>
      <View style={styles.itemView}>
        <View style={styles.contentView}>
          {/* <Text style={{ color: "#fff" }}>id Tiện Ích {data.id}</Text> */}
          <Text style={{color: '#fff'}}>
            Loại tiện ích : {data.loaiTienIch}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}>
          <TouchableOpacity
            onLongPress={() => {
              setQrLayout(old => !old);
              console.log('QrLayout', qrLayOut);
            }}>
            <View style={{flex: 1, padding: 15}}>
              <Text>{data.name}</Text>
              <Text>Vai trò {data.vaiTroNguoiDung}</Text>

              <Text>Địa chỉ : {data.tenDoiTuong}</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              flex: 1,
            }}>
            <TouchableOpacity
              onPress={() => {
                StateSend.roomId = uuid.v4() as string;

                StateSend.roomIdSend = JSON.stringify({
                  roomId: StateSend.roomId,
                  stateToken,
                });
                sendNoti();
                props.openWebRtc(StateSend.roomId);
              }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderColor: '#3e3e3e',
                  borderRadius: 40,
                  borderWidth: 7,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'red',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  SOS
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {qrLayOut && (
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={{flex: 1}} />
          <TouchableOpacity>
            <View
              style={{
                height: 40,
                backgroundColor: 'red',
                marginRight: 10,
                justifyContent: 'center',
                padding: 10,
              }}>
              <Text>Cài đặt thiết bị</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemView: {
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#7e7e7e',
    borderRadius: 20,
  },
  contentView: {
    backgroundColor: '#7e7e7e',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
});

export default ItemTienIch;
