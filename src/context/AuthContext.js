import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

const AuthContext = React.createContext(null);

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Signup function
  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const today = new Date().toDateString();

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      streak: 1,
      lastActiveDate: today,
      progress: {
        problemsSolved: 0,
        mockInterviewsTaken: 0,
        topicsCompleted: [],
      },
    });

    return userCredential;
  };

  // Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Track user login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}