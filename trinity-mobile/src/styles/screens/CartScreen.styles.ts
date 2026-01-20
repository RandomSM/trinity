import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 2,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#52B46B',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    backgroundColor: '#52B46B',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
  },
  grandTotalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#52B46B',
  },
  checkoutButton: {
    backgroundColor: '#52B46B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  captureButton: {
    backgroundColor: '#FF9500',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  pendingText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#52B46B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
