import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import appColors from '@/constants/color';
import { useRouter } from 'expo-router';
import { Checkbox } from 'tamagui'
import { signupSchema } from '@/validation';
import { signupService } from '@/services/Auth/signup.services';

const Signup = () => {
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    email: '',
    username:'',
    password: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
    setErrors({ ...errors, [key]: '' })
  }

  const handleSignup = async () => {
    // Prepare data for validation
    const data = {
      ...form
    }
    const result = signupSchema.safeParse(data)
    if (!result.success) {
      // Map Zod errors to fields
      const fieldErrors: { [key: string]: string } = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0]] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      await signupService(result.data)
      router.replace('(auth)/login' as any)
    } catch (e) {
      setErrors({ general: 'Signup failed. Please try again.' })
    }
    setLoading(false)
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-1 bg-white px-5 py-8 justify-evenly">

          <View className="mt-8 mb-6 g">
            <Text className="text-2xl font-bold text-neutral-900">
              Personal Information
            </Text>
            <Text className="text-base text-neutral-400 mt-1">
              Fill your personal info to get started
            </Text>
          </View>

          <View className="gap-4">
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12">
              <Ionicons name="person-outline" size={20} color={appColors.primary} />
              <TextInput
                className="flex-1 ml-3 bg-transparent"
                placeholder="First Name"
                value={form.fname}
                onChangeText={v => handleChange('fname', v)}
              />
            </View>
            {errors.fname && <Text className='text-red-400'>{errors.fname}</Text>}

            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12">
              <Ionicons name="person-outline" size={20} color={appColors.primary} />
              <TextInput
                className="flex-1 ml-3 bg-transparent"
                placeholder="Last Name"
                value={form.lname}
                onChangeText={v => handleChange('lname', v)}
              />
            </View>
            {errors.lname && <Text className='text-red-400'>{errors.lname}</Text>}

          

            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12">
              <Ionicons name="mail-outline" size={20} color={appColors.primary} />
              <TextInput
                className="flex-1 ml-3 bg-transparent"
                placeholder="Email"
                value={form.email}
                onChangeText={v => handleChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text className='text-red-400'>{errors.email}</Text>}

            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12">
              <Ionicons name="call-outline" size={20} color={appColors.primary} />
              <TextInput
                className="flex-1 ml-3 bg-transparent"
                placeholder="Username"
                value={form.username}
                onChangeText={v => handleChange('username', v)}
                keyboardType="default"
              />
            </View>
            {errors.username && <Text className='text-red-400'>{errors.username}</Text>}

            <View className="flex-row items-center bg-neutral-100 rounded-xl px-4 h-12">
              <Ionicons name="lock-closed-outline" size={20} color={appColors.primary} />
              <TextInput
                className="flex-1 ml-3 bg-transparent"
                placeholder="Password"
                value={form.password}
                onChangeText={v => handleChange('password', v)}
                secureTextEntry
              />
            </View>
            {errors.password && <Text className='text-red-400'>{errors.password}</Text>}
          </View>

          <View className="flex-row items-center mt-6 gap-2" >
            <Text className="text-neutral-400 text-sm mx-2">
              I agree to the Terms & Privacy Policy
            </Text>
            <Checkbox size="$4" checked={checked} onCheckedChange={(() => setChecked(!checked))}>
              <Checkbox.Indicator>
                <Ionicons name='checkmark' />
              </Checkbox.Indicator>
            </Checkbox>
          </View>

          {errors.general && <Text style={{ color: 'red', textAlign: 'center' }}>{errors.general}</Text>}

          <TouchableOpacity
            className={`mt-8 ${(!checked || loading) ? 'bg-neutral-300' : 'bg-primary'} rounded-full h-14 flex-row items-center justify-center`}
            onPress={handleSignup}
            disabled={loading || !checked}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Signup</Text>
            )}

          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Signup