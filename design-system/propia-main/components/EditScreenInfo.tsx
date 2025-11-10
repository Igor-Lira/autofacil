import { Link } from 'expo-router';
import { Text, View } from 'react-native';




export const EditScreenInfo = ({ path }: { path: string }) => {

  const title = "Open up the code for this screen:"
  const description = "Change any of the text, save the file, and your app will automatically update."

  return (
    <View>
      <Link href="/screens/home" className='text-4xl font-semibold'>Home</Link>
    </View>
  );
};

const styles = {
  codeHighlightContainer: `rounded-md px-1`,
  getStartedContainer: `items-center mx-12`,
  getStartedText: `text-lg leading-6 text-center`,
  helpContainer: `items-center mx-5 mt-4`,
  helpLink: `py-4`,
  helpLinkText: `text-center`,
  homeScreenFilename: `my-2`,
};
