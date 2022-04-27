/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import * as React from 'react';
import {ColorSchemeName} from 'react-native';

import {RootStackParamList} from './types';
import LinkingConfiguration from './LinkingConfiguration';

import MainScreen from '../screens/main';
import LoginScreen from '../screens/login';
import RegisterScreen from '../screens/register';

// import {setToken} from '../redux/features/notification/AuthNotificationSlice1';
// import {addNotification} from '../redux/features/notification/NotificationSlice';
import {/*useAppDispatch ,*/ useAppSelector} from '../redux/store/hooks';

import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';
import VideoTest from '../components/Video';
import {WebRtcServices} from '../services/WebRtcServices';
// import {useRef, useState} from 'react';

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      independent={true}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const auth = useAppSelector(state => state.auth);
  React.useEffect(() => {
    const mReft = firebase.firestore().collection(`user_${auth.stateToken}`);
    mReft.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        console.log(
          'listen StateToken change.type :',
          change.type,
          change.doc.data(),
        );

        if (change.type === 'added') {
          if (WebRtcServices.instead) {
            WebRtcServices.close();
          }
          const data = change.doc.data();
          console.log('listen ', data.roomId);
          if (data.roomId) {
            const webRtc = new WebRtcServices({roomId: data.roomId});
            webRtc.join().then(() => {
              console.log('join ok');
              mReft.get().then(value => {
                value.forEach(item => {
                  item.ref.delete().then(() => {
                    console.log('remove success');
                  });
                });
              });
            });
          }
        }
      });
    });
    return () => {
      mReft.get().then(value => {
        value.forEach(item => {
          item.ref.delete().then(() => {
            console.log('remove success');
          });
        });
      });
    };
  }, [auth.stateToken]);
  return (
    <Stack.Navigator>
      {auth.token === undefined ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
      ) : (
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{headerShown: false}}
        />
      )}

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CallWebRtc"
        component={VideoTest}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
