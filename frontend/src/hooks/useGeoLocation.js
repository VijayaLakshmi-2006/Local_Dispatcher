import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserLocationAction } from '../store/authSlice.js';
import api from '../services/api.js';

export const useGeoLocation = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const updateLocationOnServer = async (latitude, longitude) => {
      try {
        const res = await api.put('/api/auth/location', { latitude, longitude });
        if (res.data.success) {
          dispatch(updateUserLocationAction(res.data.location));
        }
      } catch (err) {
        console.error('Error updating location on server:', err);
      }
    };

    if (navigator.geolocation) {
      // 1. Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationOnServer(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation initial request error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );

      // 2. Watch position for periodic movement tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateLocationOnServer(latitude, longitude);
        },
        (error) => {
          console.warn('Geolocation watch error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  }, [isAuthenticated, user?._id, dispatch]);
};

export default useGeoLocation;
