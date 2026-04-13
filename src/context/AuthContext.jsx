import { createContext, useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../lib/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);

  // Keep ref in sync with state
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    // Check current session
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loadingRef.current) {
        console.warn("Auth check timeout - setting loading to false");
        setLoading(false);
      }
    }, 5000);

    checkUser();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
