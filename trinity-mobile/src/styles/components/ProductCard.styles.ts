import { StyleSheet } from 'react-native';

export const productCardStyles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: 100, 
    height: 100, 
    borderRadius: 8 
  },
  contentContainer: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: 'space-between' 
  },
  productName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  brandText: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 3 
  },
  categoryText: { 
    fontSize: 12, 
    color: '#888', 
    marginBottom: 3 
  },
  nutriscoreContainer: { 
    alignSelf: 'flex-start', 
    marginTop: 5 
  },
  nutriscoreText: { 
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  stockContainer: { 
    marginTop: 8 
  },
  stockRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 3 
  },
  stockLabel: { 
    fontSize: 11, 
    color: '#666' 
  },
  stockValue: { 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  progressBarContainer: { 
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 8 
  },
  price: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FF6F00' 
  },
  addButton: { 
    backgroundColor: '#52B46B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
});
