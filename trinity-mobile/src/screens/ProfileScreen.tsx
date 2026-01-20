import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { clearUser } from '../store/userSlice';
import { clearCart } from '../store/cartSlice';
import { invoicesAPI, authAPI } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const data = await invoicesAPI.getByUserId(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await authAPI.logout();
              dispatch(clearUser());
              dispatch(clearCart());
              navigation.replace('Login');
            })();
          },
        },
      ]
    );
  };

  const getOpenFoodFactsImageUrl = (barcode: string) => {
    if (!barcode) return 'https://via.placeholder.com/100x100.png?text=Produit';
    return `https://images.openfoodfacts.org/images/products/${barcode.slice(0, 3)}/${barcode.slice(3, 6)}/${barcode.slice(6, 9)}/${barcode.slice(9)}/front_fr.4.400.jpg`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en attente': return '#FFA500';
      case 'validée': return '#52B46B';
      case 'expédiée': return '#2196F3';
      case 'livrée': return '#4CAF50';
      case 'remboursée': return '#9E9E9E';
      case 'partiellement remboursée': return '#FF9800';
      case 'annulée': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en attente': return 'time-outline';
      case 'validée': return 'checkmark-circle-outline';
      case 'expédiée': return 'airplane-outline';
      case 'livrée': return 'checkmark-done-circle-outline';
      case 'remboursée': return 'refresh-circle-outline';
      case 'partiellement remboursée': return 'refresh-outline';
      case 'annulée': return 'close-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Non connecté</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Administrateur</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des commandes</Text>

        {loading && <Text style={styles.loadingText}>Chargement...</Text>}
        
        {!loading && orders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune commande</Text>
          </View>
        )}
        
        {!loading && orders.length > 0 && (
          orders.map((order) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Commande #{order._id.slice(-6)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Ionicons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <View key={item.productId || item.barcode || item._id} style={styles.orderItem}>
                      <Image
                        source={{ uri: getOpenFoodFactsImageUrl(item.barcode || item.productId) }}
                        style={styles.itemImage}
                        defaultSource={require('../../assets/icon.png')}
                        onError={() => console.log('Erreur chargement image:', item.barcode || item.productId)}
                      />
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemQuantity}>Quantité: {item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                          {(item.price || 0).toFixed(2)} € × {item.quantity} = {((item.price || 0) * item.quantity).toFixed(2)} €
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItems}>Aucun article</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>
                  Total: <Text style={styles.orderTotalAmount}>{(order.total || 0).toFixed(2)} €</Text>
                </Text>
                {order.refundAmount && (
                  <Text style={styles.refundText}>
                    Remboursement: {order.refundAmount.toFixed(2)} €
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
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
    backgroundColor: '#52B46B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  adminText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 10,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  itemsList: {
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#52B46B',
  },
  noItems: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  orderTotal: {
    fontSize: 16,
    color: '#333',
  },
  orderTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#52B46B',
  },
  refundText: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 5,
  },
});
