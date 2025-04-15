// src/utils/isTokenExpired.js
import {jwtDecode} from 'jwt-decode';

export const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;

    const expiryTime = exp * 1000; // seconds → milliseconds
    return Date.now() > expiryTime;
  } catch {
    return true; // Invalid token format
  }
};
