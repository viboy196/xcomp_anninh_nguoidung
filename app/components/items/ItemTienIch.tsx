import React, {useCallback, useState} from 'react';
import {Text, View} from '../Themed';

import {StyleSheet, TouchableOpacity} from 'react-native';
import {useAppSelector} from '../../redux/store/hooks';
import ApiRequest from '../../utils/api/Main/ApiRequest';
import uuid from 'react-native-uuid';
type Props = {
  ItemTienIch?: any;
  openWebRtc: (roomId: string) => void;
};

const ItemTienIch = (props: Props) => {
  const data = props.ItemTienIch;

  console.log('loaiTienIch', data.loaiTienIch);
  const {token} = useAppSelector(state => state.auth);
  const [roomId, setRoomId] = useState(uuid.v4() as string);
  const sendNoti = useCallback(() => {
    if (data.idTienIch && token) {
      ApiRequest.SendNotiSoS({
        idTienich: data.idTienIch,
        token: token,
        roomId,
      }).then(res => {
        console.log('SendNotiSoS', res);
      });
    }
  }, [data.idTienIch, roomId, token]);
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
              <Text>{data.tenNguoiDung}</Text>
              <Text>Vai trò {data.vaiTroNGuoiDung}</Text>

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
                setRoomId(uuid.v4() as string);
                sendNoti();
                props.openWebRtc(roomId);
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
