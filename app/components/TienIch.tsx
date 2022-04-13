import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {useAppSelector} from '../redux/store/hooks';
import ApiRequest from '../utils/api/Main/ApiRequest';
import ItemTienIch from './items/ItemTienIch';
import {Text, View} from './Themed';
type Props = {
  openWebRtc: (roomId: string, status: 'call' | 'answer') => void;
};
const TienIch = (props: Props) => {
  const tag = 'TienIch';
  const auth = useAppSelector(state => state.auth);
  const [dsTienIch, setDsTienIch] = useState<Array<any>>();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(false);
    if (auth.token && dsTienIch === undefined) {
      ApiRequest.GetTienichByNguoidung(auth.token)
        .then(data => {
          setIsLoading(true);
          setDsTienIch(data.result);
        })
        .catch(error => {
          console.log(`${tag} | useEffect | error :`, error);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);
  return (
    <View style={{}}>
      {isLoading ? (
        <FlatList
          data={dsTienIch}
          renderItem={({item}) => (
            <ItemTienIch ItemTienIch={item} openWebRtc={props.openWebRtc} />
          )}
          keyExtractor={item => item.idTienIch}
        />
      ) : (
        <View>
          <Text>Loading ....</Text>
        </View>
      )}
    </View>
  );
};

export default TienIch;
