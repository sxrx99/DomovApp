import React, { useState , useEffect} from 'react';
import { View, Text, FlatList ,Platform, Linking} from 'react-native';
import tw from 'twrnc';
import { colors } from '../theme/constants';
import DeviceCard from './DeviceCard';
import { TouchableOpacity } from 'react-native';
import ConnectModal from './Modal';
import Modal2 from './Modal2';

import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';


export default function Flat() {
  const [data, setData] = useState([
    { name: 'Domov', key: 1, connected: false },
    // { name: 'Device 2', key: 2, connected: false },
    // { name: 'Device 3', key: 3, connected: false },
    // { name: 'Device 4', key: 4, connected: false },
  ]);

  //modals 
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConnected,setModalConnnected] = useState(false);

  const [modalVisible2, setModalVisible2] = useState(false);
  
  //spliting the connected and none connected devices
  const connectedDevices = data.filter(device => device.connected === true);
  const availableDevices = data.filter(device => device.connected === false);


  const [switchValue , setSwitchValue] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;
      const ip = state.details.ipAddress;
       console.log(ip);
      // Check if the IP address is equal to '192.168.4.1'
      if (/*ip === '192.168.4.4' || !isConnected*/ true) {
        const updatedData = data.map(item => {
          if (item.name === 'Domov' ) {
            return { ...item, connected: isConnected };
          }
          return item;
        });
        setData(updatedData);
        setSwitchValue(isConnected);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const toggleDevice = (deviceId) => {
    // Delayed toggle
    setTimeout(() => {
      setData(prevData => prevData.map(device => {
        if (device.key === deviceId) {
          setModalConnnected(true);
          return { ...device, connected: !device.connected };
        }
        return device;
      }));
    }, 2000); // Adjust the delay time as needed
  };

  const handleItemPress = (deviceId, connected) => {
    if (!connected) {
      openWifiSettings();
      // setModalVisible(true);

      toggleDevice(deviceId);
      
    }
  };

  const handleItemPress2 = (deviceId, connected) => {
    if (connected) {
      openWifiSettings(); 
    }
  };

  const receiveVariableFromDeviceCard = (variable) => {
    setSwitchValue(variable);
  }

  const handleItemLongPress = (deviceId, connected) => {
    if (connected && switchValue ) {
      setModalVisible2(true);
    }
  };

  
  // Function to handle closing of the second modal
  const handleCloseModal2 = () => {
    setModalVisible2(false);
  };

   //wifi alert function
  const openWifiSettings = async () => {
    try {
      if (Platform.OS === 'android') {
        // Provide instructions to open settings manually
        alert('To manage Wi-Fi settings, go to Settings > Network & Internet > Wi-Fi');
      } else if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=WIFI');
      }
    } catch (error) {
      console.error('Error opening Wi-Fi settings:', error);
    }
  };
  
 
  return (
    <View>

      {connectedDevices.length > 0 && (
        <View>
          <Text style={[tw`ml-3 text-18px mb-5 mt-7 pb-1`, { fontFamily: 'Inter-Regular', color: colors.maingrey }]}> Connected </Text>
          <FlatList
            data={connectedDevices}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleItemPress2(item.key, item.connected)}>
              <DeviceCard
              name={item.name}
              connect={item.connected}
              sendVariableToFlat={receiveVariableFromDeviceCard}
              switchValue={switchValue}
              />
              </TouchableOpacity>
            )}
            numColumns={1}
            
          />
        </View>
      )}
      {availableDevices.length > 0 && (
        <View>
          <Text style={[tw`ml-3 text-18px mb-5 mt-7  pb-1`, { fontFamily: 'Inter-Regular', color: colors.maingrey }]}> Devices available </Text>
          <FlatList
            data={availableDevices}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleItemPress(item.key, item.connected)}>
              <DeviceCard
               name={item.name}
               connect={item.connected}
               sendVariableToFlat={receiveVariableFromDeviceCard}
               switchValue={switchValue}
              />
                
              </TouchableOpacity>
            )}
            numColumns={1}
            
          />
        </View>
      )}

      {data.length === 0 && (
        <View style={tw `flex items-center`}>
          <Text style={[tw` text-18px mt-10 `, { fontFamily: 'Inter-Regular', color: colors.maingrey }]}> no device available ...</Text>
        </View>
      )}
       
      <Modal2 isVisible={modalVisible2} onClose={handleCloseModal2} />

      <ConnectModal isVisible={modalVisible} isConnected={modalConnected}/>

    </View>
  );
}
