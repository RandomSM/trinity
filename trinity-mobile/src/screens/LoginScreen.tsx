import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { authAPI } from '../lib/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    console.log('Attempting login with:', { email, passwordLength: password.length });

    try {
      if (isLogin) {
        console.log('Calling authAPI.login...');
        const response = await authAPI.login(email, password);
        console.log('Login successful:', response);
        dispatch(setUser({
          id: response.user._id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
        }));
        navigation.replace('Main');
      } else {
        console.log('Calling authAPI.register...');
        await authAPI.register({ email, password });
        console.log('Registration successful');
        Alert.alert('Succès', 'Compte créé ! Veuillez vous connecter.');
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Login/Register error:', error.response?.data || error.message);
      Alert.alert('Erreur', error.response?.data?.error || 'Une erreur est survenue');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trinity E-Shop</Text>
      <Text style={styles.subtitle}>{isLogin ? 'Connexion' : 'Inscription'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#52B46B',
  },
  subtitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#52B46B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#52B46B',
    fontSize: 16,
  },
});
