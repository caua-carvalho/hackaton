import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/Login';
import AdminHomeScreen from './screens/home';
import Cursos from './screens/cursos';
import Disciplinas from './screens/disciplinas';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="Cursos" component={Cursos} />
        <Stack.Screen name="Disciplinas" component={Disciplinas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}