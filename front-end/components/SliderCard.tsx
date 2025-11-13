import { Link } from 'expo-router';
import { View, Text, Image, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ThemedText from './ThemedText';
import useThemeColors from '@/app/contexts/ThemeColors';
import ImageCarousel from './ImageCarousel';

const windowWidth = Dimensions.get('window').width;

interface SliderCardProps {
    title: string;
    description?: string;
    image: string | string[];
    href: string;
    className?: string;
    button?: string;
    rating?: string;
    distance?: any;
    price?: string;
}

const SliderCard = ({
    title,
    description,
    image,
    href,
    rating,
    distance,
    price,
    className = '',
    ...props
}: SliderCardProps) => {
    const colors = useThemeColors();
    const images = Array.isArray(image) ? image : [image];

    return (
        <View className={`p-global mb-0 bg-light-primary dark:bg-dark-primary w-full ${className}`} {...props}>
            <View className="w-full relative">
                <ImageCarousel
                    images={images}
                    height={300}
                    //width={windowWidth - 32}
                    rounded='xl'
                    className="rounded-2xl"
                />
            </View>
            <Link href={href} asChild>
                <TouchableOpacity>
                    <View className="flex-row w-full items-center mt-2 justify-between">
                        <ThemedText className="text-base font-semibold">{title}</ThemedText>
                        {rating &&
                            <View className="flex-row items-center">
                                <MaterialIcons name="star" size={18} color={colors.text} />
                                <ThemedText className="text-base ml-px">{rating}</ThemedText>
                            </View>
                        }
                    </View>
                    <Text className="text-sm text-light-subtext dark:text-dark-subtext">{distance} miles away</Text>
                    <ThemedText className="text-base font-bold mt-2">
                        {price} <ThemedText className="font-normal">night</ThemedText>
                    </ThemedText>
                </TouchableOpacity>
            </Link>
        </View>
    );
};

export default SliderCard;