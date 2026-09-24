import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchCart, 
  addSingleItem, 
  addBulkItems, 
  updateCartQty, 
  removeCartItem, 
  clearCartLocal 
} from '../store/cartSlice.js';

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, loading, error } = useSelector((state) => state.cart);

  const getCart = () => dispatch(fetchCart());
  
  const addToCart = (productId, quantity = 1) => {
    return dispatch(addSingleItem({ productId, quantity }));
  };

  const addItemsBulk = (itemsArray) => {
    return dispatch(addBulkItems(itemsArray));
  };

  const updateQuantity = (productId, quantity) => {
    return dispatch(updateCartQty({ productId, quantity }));
  };

  const removeFromCart = (productId) => {
    return dispatch(removeCartItem(productId));
  };

  const clearCart = () => {
    dispatch(clearCartLocal());
  };

  const totalItemsCount = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    totalPrice,
    loading,
    error,
    totalItemsCount,
    getCart,
    addToCart,
    addItemsBulk,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};

export default useCart;
