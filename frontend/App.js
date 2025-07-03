import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { toastConfig } from './utils/toast';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Home from './Pages/Home';
import CustomDrawer from './Pages/CustomDrawer';
import ProfileScreen from './Pages/User/Profile';
import DrivingQuizApp from './Pages/DrivingQuiz/DrivingQuiz';
import WeatherScreen from './Pages/Safety/Weather';
import Report from './Pages/Community/Report';
import Forum from './Pages/Community/Forum';
import AIChatbot from './Pages/Tools/AiChatBot';
import DriverWellnessCheck from './Pages/Tools/DriverWellnessCheck';
import AboutUs from './Pages/AboutUs';
const Stack = createStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#f6f6f6',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={Login} a
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="AboutUs" 
            component={AboutUs} a
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="AiChatBot" 
            component={AIChatbot} a
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="DriverWellness" 
            component={DriverWellnessCheck} a
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="Weather" 
            component={WeatherScreen} a
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="Forum" 
            component={Forum} a
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="Report" 
            component={Report} a
            options={{ headerShown: false }} 
          />


           <Stack.Screen 
            name="DrivingQuiz" 
            component={DrivingQuizApp} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={Register} 
            options={{ headerShown: false }} 
          />
            <Stack.Screen 
            name="Home" 
            component={Home} 
            options={{ headerShown: false }} 
          />
           <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast 
        config={toastConfig}
        position="top"
        topOffset={50}
        visibilityTime={3000}
        autoHide={true}
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});