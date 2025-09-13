import { View, Text, Touchable, TouchableOpacity } from 'react-native'
import React from 'react'
import { logoutService } from '@/services/Auth/login.services';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/auth';

const index = () => {
  //eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout()); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View className='flex-1 justify-center items-center bg-red-100'>
      <Text>index</Text>
      <TouchableOpacity onPress={handleLogout} className='bg-blue-500 px-4 py-2 rounded mt-4'>
        <Text className='text-white'>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default index