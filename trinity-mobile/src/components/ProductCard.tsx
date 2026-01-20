import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { productCardStyles as styles } from '../styles/components/ProductCard.styles';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    quantity?: string;
    nutriscore?: string;
    price: number;
    image_front_url?: string;
    image_url?: string;
    stock?: number;
  };
}

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return 'https://via.placeholder.com/150';

  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);

  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

function getNutriColor(nutri: string) {
  switch (nutri?.toLowerCase()) {
    case 'a': return '#16a34a'; // green-600
    case 'b': return '#84cc16'; // lime-500
    case 'c': return '#eab308'; // yellow-500
    case 'd': return '#f97316'; // orange-500
    case 'e': return '#ef4444'; // red-500
    default: return '#9E9E9E'; // gray
  }
}

export default React.memo(function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    );
    Alert.alert('Ajouté au panier', `${product.name} a été ajouté à votre panier.`);
  };

  const imageUri = product.image_front_url || product.image_url || getOpenFoodFactsImageUrl(product.id);
  const stock = product.stock ?? 0;
  const stockPercentage = Math.min((stock / 100) * 100, 100);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.contentContainer}>
        <View>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          {product.brand && (
            <Text style={styles.brandText}>
              {product.brand}
            </Text>
          )}
          {product.quantity && (
            <Text style={styles.categoryText}>
              {product.quantity}
            </Text>
          )}
          {product.nutriscore && (
            <View style={styles.nutriscoreContainer}>
              <Text style={{ 
                ...styles.nutriscoreText,
                backgroundColor: getNutriColor(product.nutriscore),
                color: 'white',
              }}>
                Nutriscore {product.nutriscore.toUpperCase()}
              </Text>
            </View>
          )}
          
          {/* Barre de stock */}
          <View style={styles.stockContainer}>
            <View style={styles.stockRow}>
              <Text style={styles.stockLabel}>Stock</Text>
              <Text style={[styles.stockValue, { color: stock > 10 ? '#52B46B' : '#ff6b6b' }]}>
                {stock} unites
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, {
                  width: `${stockPercentage}%`,
                  backgroundColor: stock > 10 ? '#52B46B' : '#ff6b6b',
                }]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {product.price.toFixed(2)}€
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: stock > 0 ? '#52B46B' : '#ccc' }]}
            onPress={handleAddToCart}
            disabled={stock === 0}
          >
            <Text style={styles.addButtonText}>
              {stock > 0 ? 'Ajouter' : 'Epuise'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});