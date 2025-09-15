import { getUsers } from '@/services/users/users.services';
import type { ProfileUser } from '@/validation/schemas/common/user';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {  SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const Index = () => {
  const router = useRouter();
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const currentUserUUID = useSelector((state: any) => state.auth.user?.uuid) as string;
  const fetchUsers = useCallback(
    async (pageNumber = 1, append = false) => {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const response = await getUsers({ page: pageNumber });
        const meta = response.data; // pagination meta
        console.log('meta :>> ', meta);
        const items: ProfileUser[] = meta.data ?? [];

        if (append) setUsers(prev => [...prev, ...items]);
        else setUsers(items);

        setPage(meta.current_page ?? pageNumber);
        setLastPage(meta.last_page ?? meta.total ?? 1);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        if (pageNumber === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(1, false);
  }, [fetchUsers]);

  const handleEndReached = () => {
    if (!loadingMore && page < lastPage) {
      fetchUsers(page + 1, true);
    }
  };

  const generateChatId = (userUuid1: string, userUuid2: string): string => {
    const sortedUuids = [userUuid1, userUuid2].sort();
    return `${sortedUuids[0]}_${sortedUuids[1]}`;
  };

  const handleNavigateToChat = (selectedUser: ProfileUser) => {

    if (currentUserUUID && selectedUser.uuid) {
      const chatId = generateChatId(currentUserUUID, selectedUser.uuid);
      console.log('Navigating to chat with ID:', chatId);
      router.push(`/chats/${chatId}`);
    } else {
      console.error('Both users must have valid UUIDs to generate a chat ID.');
    }
  }

  const renderItem = ({ item }: ListRenderItemInfo<ProfileUser>) => {
    const avatar = item.avatar;
    const firstLetter = (item.username || item.fname || item.lname || '')
      .charAt(0)
      .toUpperCase();

    return (
      <TouchableOpacity
        onPress={() => handleNavigateToChat(item)}
        className="px-4 py-3 border-b border-slate-300"
      >
        <View className="flex-row items-center">
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              className="h-12 w-12 rounded-full"
              accessibilityLabel={`${item.username} avatar`}
            />
          ) : (
            <View className="h-12 w-12 rounded-full bg-gray-300 items-center justify-center">
              <Text className="text-lg font-medium">{firstLetter}</Text>
            </View>
          )}

          <View className="ml-4">
            <Text className="text-base font-medium">{item.username}</Text>
            <Text className="text-sm text-gray-500">{item.email}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !loadingMore) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} >
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Index;