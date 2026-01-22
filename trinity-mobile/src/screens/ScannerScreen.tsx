import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { productsAPI } from '../lib/api';
import { styles } from '../styles/screens/ScannerScreen.styles';

export default function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
      setIsProcessing(false);
    });
    return unsubscribe;
  }, [navigation]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setIsProcessing(true);
    setScanned(true);
    
    try {
      const product = await productsAPI.getById(data);
      
      setIsProcessing(false);
      navigation.navigate('ProductDetail', { product });
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert(
        'Produit non trouve',
        `Code-barres: ${data}\n\nCe code ne correspond a aucun produit dans notre base.`,
        [
          { 
            text: 'Reessayer', 
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          },
          { 
            text: 'Annuler', 
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          }
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Acces a la camera requis</Text>
        <Text style={styles.infoText}>
          Nous avons besoin de votre permission pour utiliser la camera
        </Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={requestPermission}
        >
          <Text style={styles.scanButtonText}>Autoriser la camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instructionText}>
          Distance: 15-20 cm{'\n'}
          Bon eclairage necessaire{'\n'}
          Scannez lentement et clairement
        </Text>
        {isProcessing && (
          <Text style={styles.processingText}>
            Traitement...
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setScanned(false);
          setIsProcessing(false);
        }}
      >
        <Text style={styles.resetButtonText}>Reinitialiser</Text>
      </TouchableOpacity>

      {scanned && !isProcessing && (
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanButtonText}>Scanner a nouveau</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
