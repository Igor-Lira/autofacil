import React, { useState } from 'react';
import { View, Pressable, Image, TouchableOpacity, Dimensions } from 'react-native';
import ThemedText from '@/components/ThemedText';
import Section from '@/components/layout/Section';
import Favorite from '@/components/Favorite';
import { Link } from 'expo-router';
import { shadowPresets } from '@/utils/useShadow';
import ThemeScroller from '@/components/ThemeScroller';
import { Placeholder } from '@/components/Placeholder';
import ShowRating from '@/components/ShowRating';
import { LinearGradient } from 'expo-linear-gradient';
import Grid from '@/components/layout/Grid';
import AnimatedView from '@/components/AnimatedView';
import Header, { HeaderIcon } from '@/components/Header';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import { useCollapsibleTitle } from '@/app/hooks/useCollapsibleTitle';


const savedItems = [
  {
    id: 1,
    title: 'Barcelona',
    descrition: '5 saved',
    image: require('@/assets/img/room-1.avif'),
  },
  {
    id: 2,
    title: 'Paris',
    descrition: '3 saved',
    image: require('@/assets/img/room-2.avif'),
  },
  {
    id: 3,
    title: 'London',
    descrition: '2 saved',
    image: require('@/assets/img/room-3.avif'),
  },
  {
    id: 4,
    title: 'Rome',
    descrition: '1 saved',
    image: require('@/assets/img/room-4.avif'),
  },
  {
    id: 5,
    title: 'New York',
    descrition: '0 saved',
    image: require('@/assets/img/room-5.avif'),
  },
];

const FavoritesScreen = () => {
  const { width } = Dimensions.get('window');
  const [isEditMode, setIsEditMode] = useState(false);
  const { scrollY, scrollHandler, scrollEventThrottle } = useCollapsibleTitle();
  return (
    <View className="flex-1 bg-light-primary dark:bg-dark-primary">
      <AnimatedView animation="scaleIn" className='flex-1'>
        <Header rightComponents={[
          <HeaderIcon
            icon={isEditMode ? "Check" : "Edit2"}
            onPress={() => setIsEditMode(!isEditMode)}
            href="0"
          />
        ]}
          title="Favorites"
          variant="collapsibleTitle"
          scrollY={scrollY}
        />
        <ThemeScroller
          onScroll={scrollHandler}
          scrollEventThrottle={scrollEventThrottle}
          className='pt-4'
        >



          {savedItems.length > 0 ? (
            <Grid className='mt-2' columns={2} spacing={20} >
              {savedItems.map((item) => (
                <Card
                  href={`/screens/favorite-list`}
                  key={item.id}
                  title={item.title}
                  image={item.image}
                  description={item.descrition}
                  imageHeight={180}
                  rounded='2xl'
                >
                  {isEditMode && (
                    <Pressable className='absolute top-2 right-2 w-7 h-7 rounded-full bg-light-primary dark:bg-dark-primary items-center justify-center'>
                      <Icon name="X" size={18} strokeWidth={2} />
                    </Pressable>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Placeholder
              title="No saved items in this category"
              subtitle="Browse services and save your favorites"
            />
          )}
        </ThemeScroller>
      </AnimatedView>
    </View>
  );
};

interface SavedItemCardProps {
  title: string;
  image: any;
  price: string;
  rating: number;
}

const SavedItemCard = ({ title, image, price, rating }: SavedItemCardProps) => {
  return (
    <Link asChild href="/screens/product-detail">
      <TouchableOpacity
        style={{
          ...shadowPresets.card
        }}
        activeOpacity={0.8} className='w-full mb-4 flex flex-row rounded-lg bg-light-secondary dark:bg-dark-secondary'>
        <View className='w-1/3 h-[110px] relative'>
          <Image source={image} className='w-full h-full rounded-l-lg' />
          <LinearGradient
            dither={false}
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
            className='absolute w-full h-full top-0 left-0 items-start justify-start p-3 rounded-l-lg'
          >
            <Favorite initialState={true} size={20} isWhite />
          </LinearGradient>
        </View>
        <View className='p-3 flex-1 justify-between'>
          <View className='flex-1 justify-start'>
            <ThemedText className='text-sm font-semibold'>{title}</ThemedText>
          </View>
          <View className='flex-row justify-between items-end flex-1'>
            <ShowRating size='sm' rating={rating} />
            <ThemedText className='text-sm font-semibold'>{price}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default FavoritesScreen; 