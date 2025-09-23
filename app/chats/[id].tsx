import { getMessages, sendMessage } from '@/services/messages/messages.services';
import { Message } from '@/validation/schemas/messages/messages.response';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const ChatDetail = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const selectedUser = params.user ? JSON.parse(decodeURIComponent(params.user as string)) : null;
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const userId = useSelector((state: any) => state.auth.user?.uuid);
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a");
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  const scrollToBottom = useCallback((animated = false) => {
    if (flatListRef.current && messages.length > 0 && !loadingMore) {
      try {
        flatListRef.current.scrollToEnd({ animated });
      } catch (error) {
        console.log('Scroll error:', error);
      }
    }
  }, [messages.length, loadingMore]);

  const processMessagesWithDateDividers = () => {
    if (!messages.length) return [];

    const sortedMessages = [...messages];
    const items: (Message | { isDateDivider: true; date: string; id: string })[] = [];
    let currentDate: Date | null = null;

    sortedMessages.forEach((message) => {
      const messageDate = new Date(message.created_at);

      if (!currentDate || !isSameDay(currentDate, messageDate)) {
        currentDate = messageDate;
        items.push({
          isDateDivider: true,
          date: formatMessageDate(message.created_at),
          id: `divider-${message.created_at}`,
        });
      }

      items.push(message);
    });

    return items;
  };

  const fetchMessages = useCallback(async (pageParam = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      if (append) setLoadingMore(true);

      const response = await getMessages(id as string, { page: pageParam });
      const meta = response.messages;
      const items = meta?.data ?? [];

      if (append) {
        setMessages(prev => [...items, ...prev]);
      } else {
        setMessages(items);
        if (!hasScrolledToBottom && items.length > 0) {
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
              setHasScrolledToBottom(true);
            }
          }, 300);
        }
      }

      setLastPage(meta.last_page ?? null);
      setPage(meta.current_page ?? pageParam);
    } catch (error) {
      console.log('error :>> ', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [id, hasScrolledToBottom]);

  const handleRefresh = () => {
    setHasScrolledToBottom(false);
    setUserHasScrolled(false);
    setRefreshing(true);
    fetchMessages(1, false);
  };

  const handleLoadMore = () => {
    if (userHasScrolled && page < (lastPage || 1) && !loadingMore) {
      fetchMessages(page + 1, true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setSending(true);
      const response = await sendMessage({ chatId: id as string, message: inputMessage });
      const newMsg = (response as any)?.data;
      if (newMsg) setMessages(prev => [...prev, newMsg]);
      setInputMessage('');
    } catch (err) {
      console.log('err :>> ', err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages(1, false);
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0 && !loadingMore && hasScrolledToBottom) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [loading, messages.length, loadingMore, hasScrolledToBottom, scrollToBottom]);

  const renderItem = ({
    item,
  }: {
    item: Message | { isDateDivider: true; date: string; id: string };
  }) => {
    if ("isDateDivider" in item) {
      return (
        <View className="flex-row justify-center my-3">
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-xs text-gray-500 font-medium">
              {item.date}
            </Text>
          </View>
        </View>
      );
    }
    const isMe = item.user?.uuid === userId;
    const ThemeColor = "#0369a1";

    return (
      <View
        className={`mx-4 my-1 max-w-[60%] rounded-2xl p-3 ${isMe ? 'self-end rounded-tr-none' : 'bg-black/10 self-start rounded-tl-none'} ${false ? 'opacity-70' : 'opacity-100'}`}
        style={isMe ? { backgroundColor: ThemeColor } : undefined}
      >
        <Text className={isMe ? "text-white" : "text-black"}>
          {item.message}
        </Text>
        <View className="flex-row items-center justify-end mt-1">
          <Text
            className={`text-xs ${isMe ? "text-white/70" : "text-gray-500"}`}
          >
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing && !loadingMore && messages.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "white" }}
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0369a1" />
          <Text className="mt-2 text-gray-500">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 2}
      >
        {/* Header */}
        <View
          className="flex-row items-center p-4"
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 3,
            borderBottomWidth: 0.5,
            borderBottomColor: "rgba(0,0,0,0.2)",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="relative">
            <View
              className="h-10 w-10 rounded-full justify-center items-center"
              style={{ backgroundColor: "#0369a1" }}
            >
              <Text className="text-base font-medium text-white">
                {selectedUser.username?.toString().charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-lg font-medium" numberOfLines={1}>
              {selectedUser.username}
            </Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={processMessagesWithDateDividers()}
          renderItem={renderItem}
          keyExtractor={(item) =>
            "isDateDivider" in item ? item.id : item.id.toString()
          }
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#0369a1"]}
              tintColor="#0369a1"
            />
          }
          onStartReached={handleLoadMore}
          onStartReachedThreshold={0.5}
          onMomentumScrollBegin={() => setUserHasScrolled(true)}
          onScrollBeginDrag={() => setUserHasScrolled(true)}
          ListHeaderComponent={
            loadingMore ? (
              <View className="flex-row justify-center py-3">
                <ActivityIndicator size="small" color="#0369a1" />
                <Text className="ml-2 text-gray-500">Loading older messages...</Text>
              </View>
            ) : null
          }
        />

        {/* Input Container */}
        <View
          className="flex-row items-center p-3"
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 3,
            borderTopWidth: 0.5,
            borderTopColor: "rgba(0,0,0,0.2)",
            paddingBottom: Platform.OS === "ios" ? 10 : 8,
          }}
        >
          <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-3 border border-slate-200 mb-3">
            <TextInput
              className="flex-1 py-3 px-2 min-h-[45px] text-base"
              placeholder="Type a message..."
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
              style={{ color: "black" }}
              placeholderTextColor="#666"
              textAlignVertical="center"
              returnKeyType="default"
              autoCapitalize="sentences"
            />
          </View>

          <TouchableOpacity
            className="rounded-full ml-2 p-3 justify-center items-center"
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            style={{
              minWidth: 44,
              minHeight: 44,
              backgroundColor: inputMessage.trim() ? "#0369a1" : "#E5E5E5",
            }}
          >
            <Ionicons
              name="send"
              size={22}
              color={inputMessage.trim() ? "white" : "#888"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetail;