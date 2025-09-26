import { useEcho } from '@/context/EchoContext';
import { getMessages, sendMessage } from '@/services/messages/messages.services';
import { Message } from '@/validation/schemas/messages/messages.response';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

// Types for better type safety
interface ProcessedItem extends Message {
  isPending?: boolean;
  status?: 'SENT' | 'DELIVERED' | 'READ';
}

interface DateDivider {
  isDateDivider: true;
  date: string;
  id: string;
}

const ChatDetail = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const selectedUser = params.user ? JSON.parse(decodeURIComponent(params.user as string)) : null;
  const router = useRouter();
  const userId = useSelector((state: any) => state.auth.user?.uuid);

  // State management
  const [messages, setMessages] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState<number | null>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const ThemeColor = "#0369a1";
  const { echo } = useEcho();

  // Message Status Ticks Component
  const MessageStatusTicks = ({ status, isMe }: { status?: string; isMe: boolean }) => {
    if (!isMe || !status) return null;

    const getTickColor = () => status === "READ" ? "#4CAF50" : "#9E9E9E";

    const renderTicks = () => {
      switch (status) {
        case "SENT":
          return <Ionicons name="checkmark" size={14} color={getTickColor()} />;
        case "DELIVERED":
          return <Ionicons name="checkmark-done" size={14} color={getTickColor()} />;
        case "READ":
          return <Ionicons name="checkmark-done" size={14} color={getTickColor()} />;
        default:
          return null;
      }
    };

    return <View style={{ marginLeft: 4 }}>{renderTicks()}</View>;
  };

  // Utility Functions
  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a");
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && messages.length > 0 && !loadingMore) {
      try {
        flatListRef.current.scrollToEnd({ animated });
      } catch (error) {
        console.log('Scroll error:', error);
      }
    }
  }, [messages.length, loadingMore]);
  const processMessagesWithDateDividers = useCallback((): (ProcessedItem | DateDivider)[] => {
    if (!messages.length) return [];

    const items: (ProcessedItem | DateDivider)[] = [];
    let currentDate: Date | null = null;

    messages.forEach((message) => {
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
  }, [messages]);

  // Echo Real-time Messaging


  const listenForMessages = useCallback((chatId: string) => {
    try {

      if (!echo) return () => { };

      const channel = echo.channel(`chat.${chatId}`);
      console.log('🔄 Subscribing to channel:', `chat.${chatId}`);

      channel.subscribed(() => {
        console.log('✅ Successfully subscribed to channel:', `chat.${chatId}`);
      });

      channel.error((error: any) => {
        console.log('❌ Channel subscription error:', error);
      });

      const handler = (e: any) => {
        console.log('📨 Raw message received from backend:', e);

        // Extract the actual message data from the nested structure
        const messageData = e.message_content || e;
        const userData = messageData.user || e.user;

        const newMessage: ProcessedItem = {
          id: messageData.id || e.id,
          chat_id: messageData.chat_id || chatId,
          message: messageData.message || '',
          user_id: messageData.user_id || userData?.id || 0,
          user: {
            uuid: userData?.uuid || '',
            status: userData?.status || 'online',
            created_at: userData?.created_at || new Date().toISOString(),
            updated_at: userData?.updated_at || new Date().toISOString(),
            fname: userData?.fname || '',
            lname: userData?.lname || '',
            username: userData?.username || userData?.name || 'Unknown User',
            email: userData?.email || '',
            avatar: userData?.avatar || null,
            email_verified_at: userData?.email_verified_at || null,
          },
          created_at: messageData.created_at || e.created_at || new Date().toISOString(),
          updated_at: messageData.updated_at || e.updated_at || new Date().toISOString(),
          status: 'DELIVERED',
        };

        console.log('📨 Processed message for UI:', newMessage);

        setMessages(prev => {
          // Prevent duplicate messages
          const isDuplicate = prev.some(m => String(m.id) === String(newMessage.id));
          if (isDuplicate) {
            console.log('🔄 Duplicate message ignored:', newMessage.id);
            return prev;
          }

          console.log('✅ Adding new message to state:', newMessage.id);
          return [...prev, newMessage];
        });

        // Auto-scroll to bottom for new messages if user hasn't scrolled up
        setTimeout(() => {
          requestAnimationFrame(() => scrollToBottom(true));
        });
      };

      channel.listen('MessageSent', handler);
      return () => {
        try {
          channel.stopListening('MessageSent', handler);
        } catch (err) {
          console.log('Cleanup error:', err);
        }
      };
    } catch (error) {
      console.log('Error listening for messages:', error);
    }

  }, [echo, userHasScrolled, scrollToBottom]);

  const fetchMessages = useCallback(async (pageParam = 1, append = false) => {
    if (!id) return;

    try {
      if (!append) setLoading(true);
      if (append) setLoadingMore(true);

      const response = await getMessages(id as string, { page: pageParam });
      const meta = response.messages;
      const items: ProcessedItem[] = (meta?.data ?? []).map((msg: any) => ({
        ...msg,
        status: 'DELIVERED'
      }));

      if (append) {
        setMessages(prev => [...items, ...prev]);
      } else {
        setMessages(items);
        if (!hasInitiallyScrolled && items.length > 0) {
          setHasInitiallyScrolled(true);
        }
      }

      setLastPage(meta.last_page ?? null);
      setPage(meta.current_page ?? pageParam);
    } catch (error) {
      console.log('Fetch messages error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [id, hasInitiallyScrolled]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || sending) return;

    const messageContent = inputMessage.trim();
    const tempId = Date.now();

    const optimisticMessage: ProcessedItem = {
      id: tempId,
      chat_id: id as string,
      message: messageContent,
      user_id: parseInt(userId) || 0,
      user: {
        uuid: userId || '',
        status: 'online',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        fname: '',
        lname: '',
        username: 'You',
        email: '',
        avatar: null,
        email_verified_at: null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'SENT',
      isPending: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');

    // Scroll will be handled by onContentSizeChange

    try {
      setSending(true);
      const response = await sendMessage({ chatId: id as string, message: messageContent });
      const serverMessage = (response as any)?.data;

      if (serverMessage) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...serverMessage, status: 'DELIVERED', isPending: false }
              : msg
          )
        );
      }
    } catch (error) {
      console.log('Send message error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setInputMessage(messageContent);
    } finally {
      setSending(false);
    }
  }, [inputMessage, sending, id, userId]);

  const handleRefresh = useCallback(() => {
    setUserHasScrolled(false);
    setHasInitiallyScrolled(false);
    setRefreshing(true);
    fetchMessages(1, false);
  }, [fetchMessages]);

  const handleLoadMore = useCallback(() => {
    if (userHasScrolled && page < (lastPage || 1) && !loadingMore) {
      fetchMessages(page + 1, true);
    }
  }, [userHasScrolled, page, lastPage, loadingMore, fetchMessages]);

  // Effects
  useEffect(() => {
    fetchMessages(1, false);
  }, [fetchMessages]);

  useEffect(() => {
    if (!id || !echo) return;
    const unsubscribe = listenForMessages(id as string);
    return unsubscribe;
  }, [id, echo, listenForMessages]);



  // Render Functions
  const renderItem = ({ item }: { item: ProcessedItem | DateDivider }) => {
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

    const isMe = item.user?.uuid === userId || String(item.user_id) === String(userId);
    const isPending = item.isPending || false;

    return (
      <View
        className={`mx-4 my-1 max-w-[80%] rounded-2xl p-3 ${isMe ? 'self-end rounded-tr-none' : 'bg-black/10 self-start rounded-tl-none'
          }`}
        style={isMe ? { backgroundColor: ThemeColor } : undefined}
      >
        <Text className={isMe ? "text-white" : "text-black"}>
          {item.message}
        </Text>
        <View className="flex-row items-center justify-end mt-1">
          <Text className={`text-xs ${isMe ? "text-white/70" : "text-gray-500"}`}>
            {formatMessageTime(item.created_at)}
          </Text>
          {isPending ? (
            <Ionicons
              name="time-outline"
              size={14}
              color={isMe ? "white" : "#666"}
              style={{ marginLeft: 4 }}
            />
          ) : (
            <MessageStatusTicks status={item.status} isMe={isMe} />
          )}
        </View>
      </View>
    );
  };

  const renderLoadingHeader = () => (
    loadingMore ? (
      <View className="flex-row justify-center py-3">
        <ActivityIndicator size="small" color={ThemeColor} />
        <Text className="ml-2 text-gray-500">Loading older messages...</Text>
      </View>
    ) : null
  );

  if (loading && !refreshing && messages.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top", "left", "right"]}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={ThemeColor} />
          <Text className="mt-2 text-gray-500">Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
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
              style={{ backgroundColor: ThemeColor }}
            >
              <Text className="text-base font-medium text-white">
                {selectedUser?.username?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-lg font-medium" numberOfLines={1}>
              {selectedUser?.username || "Unknown User"}
            </Text>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={processMessagesWithDateDividers()}
          renderItem={renderItem}
          keyExtractor={(item) =>
            "isDateDivider" in item ? item.id : String(item.id)
          }
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={10}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[ThemeColor]}
              tintColor={ThemeColor}
            />
          }
          onStartReached={handleLoadMore}
          onStartReachedThreshold={0.5}
          onContentSizeChange={() => {
            if (hasInitiallyScrolled && !userHasScrolled) {
              requestAnimationFrame(() => scrollToBottom(true));
            }
          }}
          onMomentumScrollBegin={() => setUserHasScrolled(true)}
          onMomentumScrollEnd={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
            setUserHasScrolled(!isNearBottom);
          }}
          onScrollBeginDrag={() => setUserHasScrolled(true)}
          ListHeaderComponent={renderLoadingHeader}
          showsVerticalScrollIndicator={false}
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
              backgroundColor: inputMessage.trim() ? ThemeColor : "#E5E5E5",
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