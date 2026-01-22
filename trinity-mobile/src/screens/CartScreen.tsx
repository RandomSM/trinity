import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, AppState } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import { paypalAPI } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { styles } from '../styles/screens/CartScreen.styles';

export default function CartScreen({ navigation }: any) {
  const cart = useSelector((state: RootState) => state.cart);
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingCapture, setLoadingCapture] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const appState = useRef(AppState.currentState);
  const orderIdRef = useRef<string | null>(null);

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link recu:', event.url);
      
      WebBrowser.dismissBrowser();
      console.log('Navigateur ferme');
      
      const url = event.url;
      if (url.includes('paypal/success')) {
        console.log('Succes PayPal detecte, orderId:', orderIdRef.current);
        setPaymentPending(false);
        if (orderIdRef.current) {
          captureOrder();
        }
      } else if (url.includes('paypal/cancel')) {
        console.log('Annulation PayPal detectee');
        setPaymentPending(false);
        Alert.alert('Paiement annulé', 'Vous avez annulé le paiement.');
        setOrderId(null);
        orderIdRef.current = null;
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    console.log('Ecoute des deep links activee');

    return () => {
      subscription.remove();
      console.log('Ecoute des deep links desactivee');
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App revenue au premier plan');
        
        WebBrowser.dismissBrowser();
        
        if (paymentPending && orderIdRef.current) {
          console.log('Paiement en attente, affichage option finalisation');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [paymentPending]);

  const captureOrder = async () => {
    console.log('Finalisation du paiement, orderId:', orderId);
    if (!orderId || !user || loadingCapture) {
      console.log('Conditions non remplies pour la capture');
      return;
    }
    
    setLoadingCapture(true);
    setPaymentPending(false);
    
    try {
      await paypalAPI.captureOrder(orderId, user.id, cart.items.map(item => ({
        productId: item.id,
        barcode: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })));

      console.log('Paiement capture avec succes');
      Alert.alert(
        'Paiement réussi',
        'Votre commande a été payée avec succès.',
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(clearCart());
              setOrderId(null);
              orderIdRef.current = null;
              navigation.navigate('Profile');
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('Erreur capture:', error);
      Alert.alert('Erreur', error.message || 'Impossible de finaliser le paiement.');
    } finally {
      setLoadingCapture(false);
    }
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Retirer du panier',
        'Voulez-vous retirer cet article du panier?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Retirer', onPress: () => dispatch(removeFromCart(id)) },
        ]
      );
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour passer commande.');
      return;
    }

    if (cart.items.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez des produits avant de passer commande.');
      return;
    }

    setLoading(true);

    try {
      console.log('Creation de la commande PayPal...');
      
      const successUrl = Linking.createURL('paypal/success');
      const cancelUrl = Linking.createURL('paypal/cancel');
      
      const cleanSuccessUrl = successUrl.replace('/--/', '/');
      const cleanCancelUrl = cancelUrl.replace('/--/', '/');
      
      console.log('Success URL:', cleanSuccessUrl);
      console.log('Cancel URL:', cleanCancelUrl);
      
      const orderData = {
        userId: user.id,
        items: cart.items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: total,
        shipping: 5.99,
        returnUrl: cleanSuccessUrl,
        cancelUrl: cleanCancelUrl,
      };

      const order = await paypalAPI.createOrder(orderData);
      console.log('Commande creee, ID:', order.id);
      
      setOrderId(order.id);
      orderIdRef.current = order.id;
      setPaymentPending(true);

      const approvalLink = order.links?.find((link: any) => link.rel === 'approve');
      if (!approvalLink) {
        Alert.alert('Erreur', 'URL PayPal introuvable.');
        setLoading(false);
        return;
      }

      console.log('Ouverture de PayPal...');
      const result = await WebBrowser.openBrowserAsync(approvalLink.href, {
        dismissButtonStyle: 'close',
        controlsColor: '#52B46B',
      });
      
      console.log('Resultat WebBrowser:', result);
      
      if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('Navigateur ferme par l\'utilisateur');
      }
      
      setLoading(false);
    } catch (error: any) {
      console.log('Erreur:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la commande.');
      setLoading(false);
      setPaymentPending(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          {(item.price * item.quantity).toFixed(2)} €
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => dispatch(removeFromCart(item.id))}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.shopButtonText}>Scanner des produits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Sous-total:</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Livraison:</Text>
          <Text style={styles.totalValue}>5.99 €</Text>
        </View>
        <View style={[styles.totalContainer, styles.grandTotalContainer]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>{(total + 5.99).toFixed(2)} €</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, loading && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {loading ? 'Traitement...' : 'Passer la commande'}
          </Text>
        </TouchableOpacity>

        {paymentPending && orderId && (
          <View style={styles.pendingContainer}>
            <Ionicons name="time-outline" size={20} color="#FF9500" />
            <Text style={styles.pendingText}>Paiement en attente de confirmation</Text>
          </View>
        )}

        {orderId && (
          <TouchableOpacity
            style={[styles.captureButton, (loading || loadingCapture) && styles.disabledButton]}
            onPress={captureOrder}
            disabled={loading || loadingCapture}
          >
            <Text style={styles.captureButtonText}>
              {loadingCapture ? 'Finalisation...' : 'Finaliser le paiement'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
