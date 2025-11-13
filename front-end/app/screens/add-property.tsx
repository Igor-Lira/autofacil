import React, { useState } from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import MultiStep, { Step } from '@/components/MultiStep';
import Selectable from '@/components/forms/Selectable';
import ThemedText from '@/components/ThemedText';
import { Chip } from '@/components/Chip';
import Icon, { IconName } from '@/components/Icon';
import { Button } from '@/components/Button';
import useThemeColors from '@/app/contexts/ThemeColors';
import Input from '@/components/forms/Input';
import Section from '@/components/layout/Section';
import Counter from '@/components/forms/Counter';
import * as ImagePicker from 'expo-image-picker';
import Grid from '@/components/layout/Grid';

interface PropertyData {
    propertyType: string;
    guestAccessType: string;
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    amenities: string[];
    photos: string[];
    title: string;
    description: string;
    characteristics: string[];
}

const propertyTypeOptions: Array<{ label: string; icon: IconName; value: string }> = [
    { label: 'House', icon: 'Home', value: 'house' },
    { label: 'Apartment', icon: 'Building', value: 'apartment' },
    { label: 'Barn', icon: 'Warehouse', value: 'barn' },
    { label: 'Boat', icon: 'Ship', value: 'boat' },
    { label: 'Cabin', icon: 'TreePine', value: 'cabin' },
    { label: 'Villa', icon: 'Castle', value: 'villa' },
    { label: 'Condo', icon: 'Building2', value: 'condo' },
    { label: 'Tiny House', icon: 'Home', value: 'tiny_house' }
];

const guestAccessOptions: Array<{ label: string; description: string; icon: IconName; value: string }> = [
    {
        label: 'An entire place',
        description: 'Guests have the whole place to themselves.',
        icon: 'Home',
        value: 'entire_place'
    },
    {
        label: 'A room',
        description: 'Guests have their own room.',
        icon: 'Bed',
        value: 'private_room'
    },
    {
        label: 'A shared room',
        description: 'Guests sleep in a common area.',
        icon: 'Users',
        value: 'shared_room'
    }
];

const amenityOptions: Array<{ label: string; icon: IconName }> = [
    { label: 'Wifi', icon: 'Wifi' },
    { label: 'TV', icon: 'Tv' },
    { label: 'Kitchen', icon: 'ChefHat' },
    { label: 'Washing machine', icon: 'Shirt' },
    { label: 'Free parking', icon: 'Car' },
    { label: 'Paid parking', icon: 'ParkingCircle' },
    { label: 'Air conditioning', icon: 'Wind' },
    { label: 'Dedicated workspace', icon: 'Laptop' },
    { label: 'Pool', icon: 'Waves' },
    { label: 'Hot tub', icon: 'Bath' },
    { label: 'Patio', icon: 'TreePine' },
    { label: 'BBQ grill', icon: 'Flame' }
];

const characteristicOptions: Array<{ label: string; icon: IconName }> = [
    { label: 'Peaceful', icon: 'Leaf' },
    { label: 'Unique', icon: 'Star' },
    { label: 'Family-friendly', icon: 'Users' },
    { label: 'Stylish', icon: 'Sparkles' },
    { label: 'Spacious', icon: 'Maximize' }
];

interface StepProps {
    data: PropertyData;
    updateData: (updates: Partial<PropertyData>) => void;
}

// Step 1: Property Type
const PropertyTypeStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-semibold mt-auto'>Which of these best describes your place?</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Choose the option that best fits your property</ThemedText>
        </View>
        {propertyTypeOptions.map((option) => (
            <Selectable
                key={option.value}
                title={option.label}
                icon={option.icon}
                selected={data.propertyType === option.value}
                onPress={() => updateData({ propertyType: option.value })}
            />
        ))}
    </ScrollView>
);

// Step 2: Guest Access Type
const GuestAccessStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-semibold mt-auto'>What type of place will guests have?</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Choose what guests will have access to</ThemedText>
        </View>

        {guestAccessOptions.map((option) => (
            <View key={option.value} className="mb-1">
                <Selectable
                    title={option.label}
                    description={option.description}
                    icon={option.icon}
                    selected={data.guestAccessType === option.value}
                    onPress={() => updateData({ guestAccessType: option.value })}
                />
            </View>
        ))}
    </ScrollView>
);

// Step 3: Property Basics with Counters
const PropertyBasicsStep: React.FC<StepProps> = ({ data, updateData }) => {
    return (
        <ScrollView className="p-4 px-8">
            <View className='mb-10'>
                <ThemedText className='text-3xl font-semibold mt-auto'>Share some basics about your place</ThemedText>
                <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>You can add more details later</ThemedText>
            </View>

            <View className="mt-4">
                <View className="flex-row items-center justify-between py-4">
                    <ThemedText className="text-lg">Guests</ThemedText>
                    <Counter
                        value={data.guests}
                        onChange={(value) => updateData({ guests: value || 1 })}
                        min={1}
                        max={16}
                    />
                </View>

                <View className="flex-row items-center justify-between py-4 border-t border-light-secondary dark:border-dark-secondary">
                    <ThemedText className="text-lg">Bedrooms</ThemedText>
                    <Counter
                        value={data.bedrooms}
                        onChange={(value) => updateData({ bedrooms: value || 0 })}
                        min={0}
                        max={10}
                    />
                </View>

                <View className="flex-row items-center justify-between py-4 border-t border-light-secondary dark:border-dark-secondary">
                    <ThemedText className="text-lg">Beds</ThemedText>
                    <Counter
                        value={data.beds}
                        onChange={(value) => updateData({ beds: value || 1 })}
                        min={1}
                        max={20}
                    />
                </View>

                <View className="flex-row items-center justify-between py-4 border-t border-light-secondary dark:border-dark-secondary">
                    <ThemedText className="text-lg">Bathrooms</ThemedText>
                    <Counter
                        value={data.bathrooms}
                        onChange={(value) => updateData({ bathrooms: value || 1 })}
                        min={1}
                        max={10}
                    />
                </View>
            </View>
        </ScrollView>
    );
};

// Step 4: Amenities
const AmenitiesStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-semibold mt-auto'>Tell guests what your place has to offer</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>You can add more amenities after you publish your listing</ThemedText>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-4">
            {amenityOptions.map((amenity) => (
                <Chip
                    size='lg'
                    key={amenity.label}
                    label={amenity.label}
                    icon={amenity.icon}
                    isSelected={data.amenities.includes(amenity.label)}
                    onPress={() => {
                        const newAmenities = data.amenities.includes(amenity.label)
                            ? data.amenities.filter(a => a !== amenity.label)
                            : [...data.amenities, amenity.label];
                        updateData({ amenities: newAmenities });
                    }}
                />
            ))}
        </View>
    </ScrollView>
);

// Step 5: Photos
const PhotosStep: React.FC<StepProps> = ({ data, updateData }) => {
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            updateData({ photos: [...data.photos, result.assets[0].uri] });
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = data.photos.filter((_, i) => i !== index);
        updateData({ photos: newPhotos });
    };

    return (
        <ScrollView className="p-4 px-8">
            <View className='mb-10'>
                <ThemedText className='text-3xl font-semibold mt-auto'>Add some photos of your place</ThemedText>
                <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>You'll need at least one photo to get started. You can add more or make changes later.</ThemedText>
            </View>

            <Grid columns={2} spacing={10}>
                {data.photos.map((photo, index) => (
                    <View key={index} className="relative w-full h-44    ">
                        <Image
                            source={{ uri: photo }}
                            className="w-full h-44 rounded-lg"
                            resizeMode="cover"
                        />
                        <TouchableOpacity
                            onPress={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                        >
                            <Icon name="X" size={12} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    onPress={pickImage}
                    className="w-full h-44 rounded-lg border-2 border-dashed border-light-subtext dark:border-dark-subtext items-center justify-center"
                >
                    <Icon name="Plus" size={24} className="text-light-subtext dark:text-dark-subtext" />
                    <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext mt-1">Add photo</ThemedText>
                </TouchableOpacity>
            </Grid>
        </ScrollView>
    );
};

// Step 6: Title and Description
const TitleDescriptionStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-semibold mt-auto'>Now, let's give your place a title</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Short titles work best. Have fun with it—you can always change it later.</ThemedText>
        </View>

        <Section title="Title" titleSize="md" padding="sm">
            <Input
                variant='classic'
                containerClassName="mt-1 mb-0"
                placeholder="Enter a catchy title for your place"
                value={data.title}
                onChangeText={(text) => updateData({ title: text })}
                maxLength={50}
            />
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext">
                {data.title.length}/50
            </ThemedText>
        </Section>

        <Section title="Description" titleSize="md" padding="sm" className="mt-6">
            <Input
                variant='classic'
                containerClassName="mt-1 mb-0"
                placeholder="Describe your place to guests"
                value={data.description}
                onChangeText={(text) => updateData({ description: text })}
                isMultiline={true}
                maxLength={500}
            />
            <ThemedText className="text-xs text-light-subtext dark:text-dark-subtext mt-1">
                {data.description.length}/500
            </ThemedText>
        </Section>
    </ScrollView>
);

// Step 7: Property Characteristics
const CharacteristicsStep: React.FC<StepProps> = ({ data, updateData }) => (
    <ScrollView className="p-4 px-8">
        <View className='mb-10'>
            <ThemedText className='text-3xl font-semibold mt-auto'>Describe your place</ThemedText>
            <ThemedText className='text-base text-light-subtext dark:text-dark-subtext'>Choose up to 2 highlights. We'll use these to get your listing noticed by the right guests.</ThemedText>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-4">
            {characteristicOptions.map((characteristic) => (
                <Chip
                    size='lg'
                    key={characteristic.label}
                    label={characteristic.label}
                    icon={characteristic.icon}
                    isSelected={data.characteristics.includes(characteristic.label)}
                    onPress={() => {
                        const newCharacteristics = data.characteristics.includes(characteristic.label)
                            ? data.characteristics.filter(c => c !== characteristic.label)
                            : data.characteristics.length < 2
                                ? [...data.characteristics, characteristic.label]
                                : data.characteristics;
                        updateData({ characteristics: newCharacteristics });
                    }}
                />
            ))}
        </View>

        {data.characteristics.length >= 2 && (
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mt-4 text-center">
                You can select up to 2 characteristics
            </ThemedText>
        )}
    </ScrollView>
);

// Success Step
const SuccessStep: React.FC<StepProps> = ({ data }) => {
    return (
        <View className="p-8 flex-1 items-center justify-center">
            <Image
                source={require('@/assets/img/bed.png')}
                className="w-32 h-32 rounded-lg"
                resizeMode="cover"
            />
            <ThemedText className="text-3xl font-bold mt-8 text-center">Congratulations!</ThemedText>
            <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext text-center mb-8 mt-1">
                Your property listing has been created successfully. Let's take a look at how it appears to guests.
            </ThemedText>

            {/*<View className="w-full bg-light-secondary dark:bg-dark-secondary rounded-lg p-4 mb-8">
                <View className="flex-row items-center">
                    <Image
                        source={require('@/assets/img/room-1.avif')}
                        className="w-20 h-20 rounded-lg mr-4"
                        resizeMode="cover"
                    />

                    <View className="flex-1">
                        <ThemedText className="text-sm text-light-subtext dark:text-dark-subtext mb-0">
                            {propertyTypeOptions.find(p => p.value === data.propertyType)?.label || 'Property'}
                        </ThemedText>
                        <ThemedText className="text-base font-semibold mb-0" numberOfLines={2}>
                            {data.title || 'Your Amazing Place'}
                        </ThemedText>

                    </View>
                </View>
            </View>*/}
        </View>
    );
};

export default function AddPropertyScreen() {
    const [data, setData] = useState<PropertyData>({
        propertyType: '',
        guestAccessType: '',
        guests: 1,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: [],
        photos: [],
        title: '',
        description: '',
        characteristics: [],
    });

    const updateData = (updates: Partial<PropertyData>) => {
        setData(current => ({ ...current, ...updates }));
    };

    return (
        <MultiStep
            onComplete={() => {
                router.push('/screens/product-detail');
            }}
            onClose={() => router.push('/(drawer)/(tabs)/')}
            showStepIndicator={false}
        >
            <Step title="Property Type">
                <PropertyTypeStep data={data} updateData={updateData} />
            </Step>

            <Step title="Guest Access">
                <GuestAccessStep data={data} updateData={updateData} />
            </Step>

            <Step title="Basics">
                <PropertyBasicsStep data={data} updateData={updateData} />
            </Step>

            <Step title="Amenities">
                <AmenitiesStep data={data} updateData={updateData} />
            </Step>

            <Step title="Photos">
                <PhotosStep data={data} updateData={updateData} />
            </Step>

            <Step title="Title & Description">
                <TitleDescriptionStep data={data} updateData={updateData} />
            </Step>

            <Step title="Characteristics">
                <CharacteristicsStep data={data} updateData={updateData} />
            </Step>

            <Step title="Success">
                <SuccessStep data={data} updateData={updateData} />
            </Step>
        </MultiStep>
    );
} 