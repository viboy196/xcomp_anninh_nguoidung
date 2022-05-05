import {StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {useAppDispatch} from '../../redux/store/hooks';
import {logOut} from '../../redux/features/auth/authSlices';
import {Text, View} from '../../components/Themed';
import {tintColorLight} from '../../constants/Colors';
import {RootTabScreenProps} from '../../navigation/types';

export default function TabThreeScreen({
  navigation,
}: RootTabScreenProps<'TabThree'>) {
  const dispatch = useAppDispatch();
  return (
    <View style={styles.container}>
      <View style={styles.buttonView}>
        <TouchableOpacity
          onPress={() => {
            dispatch(logOut());
          }}>
          <Text style={styles.buttonText}>đăng xuất</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonView}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('CallWebRtc');
          }}>
          <Text style={styles.buttonText}>Vào cuộc gọi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonView: {
    width: '90%',
    height: 40,
    backgroundColor: tintColorLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
