import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

cssInterop(View, { className: 'style' });
cssInterop(Text, { className: 'style' });

const Login = () => {
  const [loading, setLoading] = useState(false);
  // const [email, setEmail] = useState('doctor@example.com');
  const [email, setEmail] = useState('PHARMAdCY_ADMIN@example.com');
  const [password, setPassword] = useState('123456');
const router = useRouter();
  const handleLogin = async () => {
    try {
      setLoading(true);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center bg-white'>
      <View className='flex flex-col items-center mb-6 gap-2'>
        <Image
          source={require('../../assets/images/splash.png')}
          style={{ width: 150, height: 150, marginBottom: 8 }}
        />
        <Text className='text-center text-slate-700 font-bold text-2xl'>Welcome Back !</Text>
        <Text className='text-center text-slate-700'>Hope You are Doing well</Text>
      </View>
      <View style={{ width: 300 }}>
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12 mb-2">
          <TextInput
            style={{ flex: 1, marginLeft: 12, backgroundColor: 'transparent' }}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12 mb-4">
          <TextInput
            style={{ flex: 1, marginLeft: 12, backgroundColor: 'transparent', color: 'black' }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          className={`rounded-full h-12 items-center justify-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white font-bold text-lg">{loading ? 'Loading...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity disabled={loading} onPress={() => router.push('/(auth)/signup')}>
        <Text className='text-blue-500 mt-4'>{`Don't have an account? Sign Up`}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
