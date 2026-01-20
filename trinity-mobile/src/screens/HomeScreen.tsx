import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenue {user?.firstName || 'Client'}!</Text>
        <Text style={styles.subtitle}>Votre application d'achat</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, styles.scanCard]}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Ionicons name="scan" size={48} color="#fff" />
          <Text style={styles.cardTitle}>Scanner</Text>
          <Text style={styles.cardSubtitle}>Scanner un produit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cartCard]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart" size={48} color="#fff" />
          <Text style={styles.cardTitle}>Panier</Text>
          <Text style={styles.cardSubtitle}>{cartItems.length} article(s)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.profileCard]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="receipt" size={48} color="#fff" />
          <Text style={styles.cardTitle}>Historique</Text>
          <Text style={styles.cardSubtitle}>Mes achats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.accountCard]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={48} color="#fff" />
          <Text style={styles.cardTitle}>Mon compte</Text>
          <Text style={styles.cardSubtitle}>Profil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#52B46B" />
        <Text style={styles.infoText}>
          Scannez les codes-barres des produits pour les ajouter à votre panier !
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#52B46B',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  scanCard: {
    backgroundColor: '#FF6F00',
  },
  cartCard: {
    backgroundColor: '#52B46B',
  },
  profileCard: {
    backgroundColor: '#2196F3',
  },
  accountCard: {
    backgroundColor: '#9C27B0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
    textAlign: 'center',
  },
  infoBox: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});
