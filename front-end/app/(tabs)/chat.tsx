import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import ThemedText from '@/components/ThemedText';
import AnimatedView from '@/components/AnimatedView';
import { Chip } from '@/components/Chip';
import { CardScroller } from '@/components/CardScroller';
import Section from '@/components/layout/Section';
import { useCollapsibleTitle } from '@/app/hooks/useCollapsibleTitle';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  propertyImage?: string;
  destination?: string;
  dates?: string;
  type: 'host' | 'guest' | 'support';
}

// Mock data for demonstration
const mockChats: ChatUser[] = [
  {
    id: '1',
    name: 'Sarah (Host)',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Welcome to Barcelona! Check-in is at 3 PM. Let me know if you need anything.',
    timestamp: '2m ago',
    unread: true,
    propertyImage: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
    destination: 'Barcelona, Spain',
    dates: 'Dec 15-22',
    type: 'host',
  },
  {
    id: '2',
    name: 'Michael (Host)',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Thanks for staying! Hope you enjoyed your time in Paris.',
    timestamp: '1h ago',
    unread: false,
    propertyImage: 'https://images.pexels.com/photos/1571457/pexels-photo-1571457.jpeg?auto=compress&cs=tinysrgb&w=400',
    destination: 'Paris, France',
    dates: 'Nov 8-15',
    type: 'host',
  },
  {
    id: '3',
    name: 'Emma (Guest)',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Hi! I\'ll be arriving around 6 PM. Is that okay for check-in?',
    timestamp: '3h ago',
    unread: true,
    destination: 'Your place in NYC',
    dates: 'Dec 20-27',
    type: 'guest',
  },
  {
    id: '4',
    name: 'David (Host)',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'The WiFi password is "welcome123". Enjoy your stay!',
    timestamp: '5h ago',
    unread: false,
    propertyImage: 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=400',
    destination: 'London, UK',
    dates: 'Oct 12-19',
    type: 'host',
  },
  {
    id: '5',
    name: 'Airbnb Support',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'We\'ve processed your refund. It should appear in 3-5 business days.',
    timestamp: 'Yesterday',
    unread: false,
    type: 'support',
  },
  {
    id: '6',
    name: 'Lisa (Host)',
    avatar: 'https://i.pravatar.cc/150?img=6',
    lastMessage: 'The apartment is ready for your arrival. See you soon!',
    timestamp: '2 days ago',
    unread: true,
    propertyImage: 'https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=400',
    destination: 'Rome, Italy',
    dates: 'Jan 5-12',
    type: 'host',
  },
  {
    id: '7',
    name: 'Airbnb Support',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'We\'ve processed your refund. It should appear in 3-5 business days.',
    timestamp: 'Yesterday',
    unread: false,
    type: 'support',
  },
  {
    id: '8',
    name: 'Lisa (Host)',
    avatar: 'https://i.pravatar.cc/150?img=6',
    lastMessage: 'The apartment is ready for your arrival. See you soon!',
    timestamp: '2 days ago',
    unread: true,
    propertyImage: 'https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg?auto=compress&cs=tinysrgb&w=400',
    destination: 'Rome, Italy',
    dates: 'Jan 5-12',
    type: 'host',
  },
];

type FilterType = 'all' | 'read' | 'unread';

export default function ChatListScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const { scrollY, onScroll, scrollEventThrottle } = useCollapsibleTitle();
  // Filter chats based on selection
  const filteredChats = mockChats.filter(chat => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'read') return !chat.unread;
    if (selectedFilter === 'unread') return chat.unread;
    return true;
  });

  // Count messages by filter type
  const unreadCount = mockChats.filter(chat => chat.unread).length;
  const readCount = mockChats.filter(chat => !chat.unread).length;

  const renderChatItem = ({ item }: { item: ChatUser }) => (
    <Link href={`/screens/chat/${item.id}`} asChild>
      <TouchableOpacity activeOpacity={0.8} className="flex-row p-4 border-b border-light-secondary dark:border-dark-secondary">
        {/* Property Image or Avatar */}
        <View className="relative">
          {item.propertyImage ? (
            <View className="relative">
              <Image 
                source={{ uri: item.propertyImage }} 
                className="w-16 h-16 rounded-xl"
              />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white dark:border-dark-primary">
                <Image source={{ uri: item.avatar }} className='w-7 h-7 rounded-full' />
              </View>
            </View>
          ) : (
            <Avatar size="lg" src={item.avatar} name={item.name} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 ml-5">
          {/* Name and Time */}
          <View className="flex-row justify-between items-center mb-1">
            <ThemedText className="font-medium text-base" numberOfLines={1}>
              {item.name}
            </ThemedText>
            <View className='flex-row items-center'>
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                {item.timestamp}
              </ThemedText>
              {item.unread && (
                <View className="w-2 h-2 rounded-full bg-highlight ml-2" />
              )}
            </View>
          </View>

          {/* Message */}
          <ThemedText
            numberOfLines={1}
            className={`text-sm mb-1 ${item.unread ? 'text-black dark:text-white font-medium' : 'text-light-subtext dark:text-dark-subtext'}`}
          >
            {item.lastMessage}
          </ThemedText>

          {/* Destination and Dates */}
          {item.destination && (
            <View className="flex-row items-center justify-start">
              <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext" numberOfLines={1}>
                {item.destination}
              </ThemedText>
              <View className='w-px h-px rounded-full bg-light-subtext dark:bg-dark-subtext mx-1' />
              {item.dates && (
                <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                  {item.dates}
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <>
      <Header

        title="Chat"
        variant="collapsibleTitle"
        scrollY={scrollY}
      />
      <View className="flex-1 bg-light-primary dark:bg-dark-primary">


        <AnimatedView animation="scaleIn" className='flex-1'>
          <View className="px-4 py-0">
            <CardScroller className='mb-2' space={5}>
              <Chip
                label="All"
                size='lg'
                isSelected={selectedFilter === 'all'}
                onPress={() => setSelectedFilter('all')}
              />
              <Chip
                label={`Unread (${unreadCount})`}
                size='lg'
                isSelected={selectedFilter === 'unread'}
                onPress={() => setSelectedFilter('unread')}
              />
              <Chip
                label={`Read (${readCount})`}
                size='lg'
                isSelected={selectedFilter === 'read'}
                onPress={() => setSelectedFilter('read')}
              />
            </CardScroller>
          </View>

          <FlatList
            className='pb-80'
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
            ListFooterComponent={
              <View className='h-52' />
            }
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </AnimatedView>
      </View>
    </>
  );
}