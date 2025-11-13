import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '@/components/Header';
import ThemedScroller from '@/components/ThemeScroller';
import Input from '@/components/forms/Input';
import Section from '@/components/layout/Section';
import { Button } from '@/components/Button';
import Divider from '@/components/layout/Divider';
import { Chip } from '@/components/Chip';
import Icon from '@/components/Icon';
import Expandable from '@/components/Expandable';

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <>
      <Header showBackButton
        rightComponents={[
          <Button title="Save changes" textClassName='text-white' />
        ]}
      />
      <ThemedScroller>
        <Section titleSize='3xl' className='pt-4 pb-10' title="Profile Settings" subtitle="Manage your account settings" />

        <View className="items-center flex-col mb-8 mt-6">
          <TouchableOpacity
            onPress={pickImage}
            className="relative"
            activeOpacity={0.9}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                className="w-28 h-28 rounded-full border border-light-primary dark:border-dark-primary"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-light-secondary dark:bg-dark-secondary items-center justify-center">
                <Icon name="Plus" size={25} className="text-light-subtext dark:text-dark-subtext" />
              </View>
            )}

          </TouchableOpacity>
          <View className="mt-4">
            <Button title={profileImage ? 'Change photo' : 'Upload photo'} variant='outline' onPress={pickImage} />

            {profileImage && (
              <Button
                className='mt-2'
                title="Remove photo"
                variant="ghost"
                onPress={() => setProfileImage(null)}
              />
            )}
          </View>
        </View>
        <Expandable icon="UserRoundPen" title="Personal information" description="Manage your personal information">
          <View className="flex-col gap-2">
            <Input
              label="First Name"
              value="John"
              keyboardType="email-address"
              autoCapitalize="none" />
            <Input
              label="Last Name"
              value="Doe"
              keyboardType="email-address"
              autoCapitalize="none" />
          </View>

        </Expandable>
        <Expandable icon="Lightbulb" title="Interests" description="Personalize your experience">
          <View className="flex-row gap-2 flex-wrap">
            <Chip label="Beach" />
            <Chip label="Mountain" />
            <Chip label="City" />
            <Chip label="Countryside" />
            <Chip label="Lake" />
            <Chip label="Forest" />
            <Chip label="Desert" />
            <Chip label="Snow" />
            <Chip label="Arctic" />
            <Chip label="Tropical" />
            <Chip label="Tundra" />
            <Chip label="Volcanic" />

          </View>
        </Expandable>

        <Expandable icon="Mail" title="Email and phone" description="Manage your email">
          <View className="flex-col gap-2">
            <Input
              label="Email"
              value="john.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none" />
            <Input
              label="Phone"
              value="+1234567890"
              keyboardType="email-address"
              autoCapitalize="none" />
          </View>

        </Expandable>

        <Expandable icon="LockIcon" title="Password" description="Manage your password">
          <View className="flex-col gap-2">
            <Input
              label="Current password"
              value="********"
              keyboardType="email-address"
              autoCapitalize="none" />
            <Input
              label="New password"
              value="********"
              keyboardType="email-address"
              autoCapitalize="none" />
          </View>

        </Expandable>





      </ThemedScroller>
    </>
  );
}