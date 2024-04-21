import { View, Text, LogBox } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/HomeScreen'

const Stack = createNativeStackNavigator()

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state'])
export default function AppNavigation() {
  return (
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen options={{headerShown: false}} name="Home" component={HomeScreen} />
          
        </Stack.Navigator>
    </NavigationContainer>
  )
}