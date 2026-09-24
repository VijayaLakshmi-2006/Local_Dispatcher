import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout, loadUserProfile, addUserAddress, updateUserAddress, deleteUserAddress } from '../store/authSlice.js';
import authService from '../services/authService.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const registerUser = async (userData) => {
    const data = await authService.register(userData);
    if (data.success) {
      dispatch(loginSuccess({ user: data.user, token: data.accessToken }));
    }
    return data;
  };

  const loginUser = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success) {
      dispatch(loginSuccess({ user: data.user, token: data.accessToken }));
    }
    return data;
  };

  const loginWithGoogle = async (googleData) => {
    const data = await authService.googleLogin(googleData);
    if (data.success) {
      dispatch(loginSuccess({ user: data.user, token: data.accessToken }));
    }
    return data;
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const addAddress = (addressData) => {
    return dispatch(addUserAddress(addressData));
  };

  const updateAddress = (addressId, addressData) => {
    return dispatch(updateUserAddress({ addressId, addressData }));
  };

  const deleteAddress = (addressId) => {
    return dispatch(deleteUserAddress(addressId));
  };

  const verifyToken = (tokenStr) => {
    return dispatch(loadUserProfile(tokenStr));
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    addAddress,
    updateAddress,
    deleteAddress,
    verifyToken,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'delivery_agent',
    isCustomer: user?.role === 'customer' || !user?.role,
  };
};

export default useAuth;
