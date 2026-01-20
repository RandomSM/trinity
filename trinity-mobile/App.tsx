import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import { Ionicons } from '@expo/vector-icons';

// Screens (we'll create these next)
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ProductsScreen from './src/screens/ProductsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#52B46B',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Produits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{ title: 'Détails du produit' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
