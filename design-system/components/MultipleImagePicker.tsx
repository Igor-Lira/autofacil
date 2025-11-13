import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View, Image, Pressable, Dimensions, Text, ScrollView } from 'react-native';
import Icon from './Icon';
import React from 'react';
import { CardScroller } from './CardScroller';

interface MultipleImagePickerProps {
    onImageSelect?: (uri: string) => void;
    hasMainImage?: boolean;
}

const windowWidth = Dimensions.get('window').width;

export const MultipleImagePicker: React.FC<MultipleImagePickerProps> = ({ onImageSelect, hasMainImage = true }) => {
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);

    const handleDelete = (index?: number) => {
        if (typeof index === 'undefined') {
            setMainImage(null);
        } else {
            setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        }
    };

    const pickImage = async (isMain: boolean = false) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [5, 4],
            quality: 1,
            allowsMultipleSelection: true,
            selectionLimit: isMain ? 1 : 4
        });

        if (!result.canceled) {
            if (isMain) {
                const uri = result.assets[0].uri;
                setMainImage(uri);
                onImageSelect?.(uri);
            } else {
                const newImages = result.assets.map(asset => asset.uri);
                setAdditionalImages(prev => {
                    const combined = [...prev, ...newImages];
                    return combined.slice(0, 4); // Limit to 4 images
                });
            }
        }
    };

    return (
        <>
            <Text className='text-sm dark:text-white mb-2'>Images</Text>
            <CardScroller>
                {mainImage ? (
                    <View className='relative'>
                        <Pressable onPress={() => pickImage(true)} className='w-28 overflow-hidden relative h-28 border border-black dark:border-white rounded-xl flex flex-col items-center justify-center' android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                            <Image className="w-full h-full" source={{ uri: mainImage }} />
                        </Pressable>
                        <Pressable onPress={() => handleDelete()} className='w-7 h-7 items-center justify-center absolute top-2 right-2 bg-white dark:bg-dark-secondary rounded-lg'>
                            <Icon name="Trash2" size={18} />
                        </Pressable>
                    </View>
                ) : (
                    hasMainImage && (
                        <Pressable onPress={() => pickImage(true)} className='w-28 relative h-28 border border-black dark:border-white rounded-xl p-4 flex flex-col items-center justify-center' android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                            <Icon name="Camera" size={24}  />
                        <Text className='text-black dark:text-white text-xs w-full text-center absolute bottom-4'>Main photo</Text>
                    </Pressable>
                    )
                )}
                {[...Array(4)].map((_, index) => {
                    const image = additionalImages[index];
                    return (
                        <View key={index} className='relative'>
                            {image ? (
                                <>
                                    <Pressable onPress={() => pickImage(false)} className='w-28 overflow-hidden relative h-28 border border-black dark:border-white rounded-xl flex flex-col items-center justify-center' android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                                        <Image className="w-full h-full" source={{ uri: image }} />
                                    </Pressable>
                                    <Pressable onPress={() => handleDelete(index)} className='w-7 h-7 items-center justify-center absolute top-2 right-2 bg-white rounded-lg'>
                                        <Icon name="Trash2" size={18} />
                                    </Pressable>
                                </>
                            ) : (
                                <Pressable onPress={() => pickImage(false)} className='w-28 h-28 opacity-40 border border-black dark:border-white rounded-xl p-4 flex flex-col items-center justify-center' android_ripple={{ color: 'rgba(0,0,0,0.3)', borderless: false }}>
                                    <Icon name="Plus" size={24} />
                                </Pressable>
                            )}
                        </View>
                    );
                })}
            </CardScroller>
        </>
    );
};