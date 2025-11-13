import React from 'react';
import { View, ScrollView } from 'react-native';
import { Chip } from './Chip';
import ThemedText from './ThemedText';
import Avatar from './Avatar';

export default function ChipExamples() {
  return (
    <ScrollView className="flex-1 p-4">
      <ThemedText className="text-xl font-bold mb-4">Chip Sizes</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Extra Small" size="xs" />
        <Chip label="Small" size="sm" />
        <Chip label="Medium" size="md" />
        <Chip label="Large" size="lg" />
        <Chip label="Extra Large" size="xl" />
        <Chip label="2XL" size="xxl" />
      </View>

      <ThemedText className="text-xl font-bold mb-4">Selected State</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Not Selected" />
        <Chip label="Selected" isSelected />
      </View>

      <ThemedText className="text-xl font-bold mb-4">With Icons</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Home" icon="Home" />
        <Chip label="Settings" icon="Settings" isSelected />
        <Chip label="Search" icon="Search" size="lg" />
        <Chip label="Notifications" icon="Bell" size="xl" isSelected />
      </View>

      <ThemedText className="text-xl font-bold mb-4">With Images</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip 
          label="John Doe" 
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/108.jpg' }} 
        />
        <Chip 
          label="Jane Smith" 
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/107.jpg' }} 
          isSelected 
        />
        <Chip 
          label="Mike Johnson" 
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/106.jpg' }} 
          size="lg" 
        />
      </View>

      <ThemedText className="text-xl font-bold mb-4">As Links</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip label="Go to Home" href="/" icon="Home" />
        <Chip label="Profile" href="/profile" icon="User" isSelected />
        <Chip 
          label="Settings" 
          href="/settings" 
          icon="Settings" 
          size="lg" 
        />
      </View>

      <ThemedText className="text-xl font-bold mb-4">With Custom Left Content</ThemedText>
      <View className="flex-row flex-wrap gap-2 mb-6">
        <Chip 
          label="Custom Avatar" 
          leftContent={<Avatar src="https://mighty.tools/mockmind-api/content/human/105.jpg" size="xs" className="mr-2" />} 
          size="lg"
        />
        <Chip 
          label="Custom Badge" 
          leftContent={
            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          } 
          isSelected
        />
      </View>
    </ScrollView>
  );
} 