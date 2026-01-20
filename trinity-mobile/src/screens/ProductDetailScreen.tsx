import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { product } = route.params;
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      Alert.alert('Rupture de stock', 'Ce produit n\'est pas disponible actuellement.');
      return;
    }

    dispatch(addToCart({
      id: product._id || product.code,
      name: product.product_name || product.name,
      price: product.price || 0,
      quantity: 1,
    }));

    Alert.alert(
      'Ajouté au panier',
      `${product.product_name || product.name} a été ajouté à votre panier.`,
      [
        { text: 'Continuer', onPress: () => navigation.goBack() },
        { text: 'Voir le panier', onPress: () => navigation.navigate('Main', { screen: 'Cart' }) },
      ]
    );
  };

  const getImageUrl = (product: any) => {
    if (product.image_url) return product.image_url;
    if (product.image_front_url) return product.image_front_url;
    
    const barcode = product.code || product._id;
    if (barcode && barcode.length >= 13) {
      const part1 = barcode.slice(0, 3);
      const part2 = barcode.slice(3, 6);
      const part3 = barcode.slice(6, 9);
      const part4 = barcode.slice(9);
      return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
    }
    
    return 'https://via.placeholder.com/300x300.png?text=No+Image';
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: getImageUrl(product) }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.name}>{product.product_name || product.name}</Text>
        
        {(product.brands || product.brand) && (
          <Text style={styles.brand}>Marque: {product.brands || product.brand}</Text>
        )}

        {product.category && (
          <Text style={styles.category}>Catégorie: {product.category}</Text>
        )}

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{(product.price || 0).toFixed(2)} €</Text>
          <Text style={[styles.stock, product.stock > 0 ? styles.inStock : styles.outOfStock]}>
            {product.stock > 0 ? `En stock (${product.stock})` : 'Rupture de stock'}
          </Text>
        </View>

        {product.nutritional_info && (
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Informations nutritionnelles</Text>
            <View style={styles.nutritionGrid}>
              {product.nutritional_info.energy && (
                <Text style={styles.nutritionItem}>Énergie: {product.nutritional_info.energy} kcal</Text>
              )}
              {product.nutritional_info.proteins && (
                <Text style={styles.nutritionItem}>Protéines: {product.nutritional_info.proteins}g</Text>
              )}
              {product.nutritional_info.carbohydrates && (
                <Text style={styles.nutritionItem}>Glucides: {product.nutritional_info.carbohydrates}g</Text>
              )}
              {product.nutritional_info.fat && (
                <Text style={styles.nutritionItem}>Lipides: {product.nutritional_info.fat}g</Text>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.addButton, product.stock <= 0 && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Text style={styles.addButtonText}>
            {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  brand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#52B46B',
  },
  stock: {
    fontSize: 14,
    fontWeight: '600',
  },
  inStock: {
    color: '#52B46B',
  },
  outOfStock: {
    color: '#ff4444',
  },
  nutritionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  nutritionGrid: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
  },
  nutritionItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#52B46B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
