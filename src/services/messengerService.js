import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch messenger details by ID/IdNumber
 */
export const getMessengerById = async (id, token) => {
  const response = await axios.get(`${API_URL}/messengers/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Send updated messenger data to REST API
 */
export const updateMessenger = async (id, messengerData, token) => {
  const response = await axios.put(`${API_URL}/messengers/${id}`, messengerData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};