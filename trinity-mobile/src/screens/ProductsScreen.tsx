import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsPage } from '../store/productsSlice';
import { RootState, AppDispatch } from '../store/store';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');
const cardWidth = (width - 20) / 2 - 10; // 2 columns with margins

export default function ProductsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, loadingMore, error, hasMore, page } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProductsPage({ page: 1 }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      dispatch(fetchProductsPage({ page: page + 1 }));
    }
  }, [dispatch, loadingMore, hasMore, loading, page]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ padding: 10 }}>
        <ActivityIndicator size="small" color="#FF6F00" />
      </View>
    );
  };

  if (loading && products.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6F00" />
      </View>
    );
  }

  if (error && products.length === 0) {
    Alert.alert('Erreur', error);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 20 }}>Produits</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ padding: 10 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}