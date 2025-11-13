import { useBusinessMode } from "@/app/contexts/BusinesModeContext";
import { Pressable, Text, View, Animated, Easing } from "react-native";
import { Feather } from "@expo/vector-icons";
import Icon from "./Icon";
import useThemeColors from "@/app/contexts/ThemeColors";
import { useRef } from "react";


const BusinessSwitch = () => {
    const { isBusinessMode, toggleMode } = useBusinessMode();
    const colors = useThemeColors();
    const rotationAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        // Reset the rotation value to 0 if it's at 1
        rotationAnim.setValue(0);
        
        // Animate to 1 (which represents 360 degrees)
        Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
        
        // Toggle the business mode
        toggleMode();
    };

    // Create the rotation interpolation
    const spin = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View className="absolute bottom-0 w-full items-center justify-center pb-4">
            <Pressable
                onPress={handlePress}
                style={{
                    shadowColor: "#000", // iOS shadow color
                    shadowOffset: { width: 0, height: 2 }, // iOS shadow offset
                    shadowOpacity: 0.5, // iOS shadow opacity
                    shadowRadius: 3.84, // iOS shadow radius
                    elevation: 8, // Android shadow
                }}
                className="bg-neutral-900 dark:bg-neutral-100 rounded-full py-3 w-[220px] items-center justify-center flex flex-row"
            >
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="RefreshCw" size={18} color={colors.invert} />
                </Animated.View>
                <Text className="text-white text-base ml-3 font-medium dark:text-neutral-900">
                    {isBusinessMode ? "Switch to travelling" : "Switch to hosting"}
                </Text>
            </Pressable>
        </View>
    );
};

export default BusinessSwitch;
