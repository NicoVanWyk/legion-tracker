import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // Register a new user - using useCallback to avoid dependency issues
  const signup = useCallback(async (email, password, displayName) => {
    try {
      setError('');
      
      // Step 1: Create Firebase Auth user
      console.log("Creating auth user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Step 2: Update the user profile with display name
      console.log("Updating auth profile...");
      await updateProfile(userCredential.user, { 
        displayName: displayName || email.split('@')[0] // Use email username as fallback
      });
      
      // Step 3: Create user document in Firestore
      console.log("Creating Firestore user document...");
      const userData = {
        email,
        displayName: displayName || email.split('@')[0], // Same fallback
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log("User document created successfully");
      
      return userCredential.user;
    } catch (err) {
      console.error("Error during signup:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign in existing user
  const login = useCallback(async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      
      return userCredential.user;
    } catch (err) {
      console.error("Error during login:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Sign out
  const logout = useCallback(() => {
    return signOut(auth).catch(err => {
      console.error("Logout error:", err);
      setError(err.message);
    });
  }, []);

  // Reset password
  const resetPassword = useCallback((email) => {
    return sendPasswordResetEmail(auth, email).catch(err => {
      console.error("Reset password error:", err);
      setError(err.message);
      throw err;
    });
  }, []);

  // Fetch user profile data from Firestore
  const fetchUserProfile = useCallback(async (uid) => {
    try {
      console.log("Fetching user profile for:", uid);
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        console.log("User profile found:", userDoc.data());
        setUserProfile(userDoc.data());
      } else {
        console.log("No user profile found - creating one");
        
        // Create a basic profile if it doesn't exist
        if (auth.currentUser) {
          const basicProfile = {
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          };
          
          await setDoc(userRef, basicProfile);
          setUserProfile(basicProfile);
          console.log("Created basic profile successfully");
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Error fetching user profile: ' + err.message);
    }
  }, []);

  // Update user profile in Firestore
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      if (!auth.currentUser) return false;
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, 
        { ...profileData, updatedAt: serverTimestamp() }, 
        { merge: true }
      );
      
      // Update auth profile if displayName is provided
      if (profileData.displayName) {
        await updateProfile(auth.currentUser, { 
          displayName: profileData.displayName 
        });
      }
      
      // Refresh profile data
      await fetchUserProfile(auth.currentUser.uid);
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Error updating user profile: ' + err.message);
      return false;
    }
  }, [fetchUserProfile]);

  // Observer for auth state changes
  useEffect(() => {
    console.log("Setting up auth state observer");
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      
      try {
        setCurrentUser(user);
        
        if (user) {
          await fetchUserProfile(user.uid);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error("Error during auth state change handling:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth state observer");
      unsubscribe();
    };
  }, [fetchUserProfile]); // Now includes fetchUserProfile as dependency

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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;