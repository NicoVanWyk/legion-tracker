// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Register a new user
  const signup = async (email, password, displayName) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
      });
      
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in existing user
  const login = async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        console.log('No user profile found');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Error fetching user profile');
    }
  };

  // Update user profile in Firestore
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser) return;
      
      await setDoc(doc(db, 'users', currentUser.uid), 
        { ...profileData, updatedAt: serverTimestamp() }, 
        { merge: true }
      );
      
      // Refresh profile data
      await fetchUserProfile(currentUser.uid);
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Error updating user profile');
      return false;
    }
  };

  // Observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;