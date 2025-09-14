import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { logoutService } from '@/services/Auth/login.services';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/auth';
import { SearchBar } from '@/components/atoms/Searchbar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Index = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout()); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View className='flex-1 justify items-center bg-red-100'>
      <SearchBar />
      <Text>index</Text>
      <TouchableOpacity onPress={handleLogout} className='bg-blue-500 px-4 py-2 rounded mt-4'>
        <Text className='text-white'>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="absolute bottom-8 right-5 bg-blue-600 rounded-full w-16 h-16 justify-center items-center shadow-lg"
        onPress={() => {
          router.push('/users');
        }}
      >
        <Text className="text-white text-3xl font-bold">
          <Ionicons name="add" size={32} color="white" />
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Index