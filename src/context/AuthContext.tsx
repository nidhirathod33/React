import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'faculty' | 'student' | 'parent') => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

interface SignupData {
  role: 'faculty' | 'student' | 'parent';
  full_name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.user_metadata?.role);
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.user_metadata?.role);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, role?: string) => {
    try {
      let userData = null;

      if (role === 'faculty') {
        const { data } = await supabase
          .from('faculty')
          .select('*')
          .eq('id', userId)
          .single();
        if (data) userData = { ...data, role: 'faculty' };
      } else if (role === 'student') {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .single();
        if (data) userData = { ...data, role: 'student' };
      } else if (role === 'parent') {
        const { data } = await supabase
          .from('parents')
          .select('*')
          .eq('id', userId)
          .single();
        if (data) userData = { ...data, role: 'parent' };
      }

      if (userData) {
        setUser(userData);
        console.log("✅ Success: User profile fetched", userData);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string, role: 'faculty' | 'student' | 'parent') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("✅ Success: Login successful", data);
    } catch (error: any) {
      console.error("❌ Error:", error);
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      // Create user in Supabase Auth with metadata
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.full_name,
            role: signupData.role
          }
        }
      });

      if (error) throw error;
      console.log("✅ Success: Auth user created", data);

      if (data.user) {
        // Insert into appropriate table based on role
        const userData = {
          id: data.user.id,
          full_name: signupData.full_name,
          email: signupData.email,
          created_at: new Date().toISOString()
        };

        let insertError;
        if (signupData.role === 'faculty') {
          const { error } = await supabase.from('faculty').insert(userData);
          insertError = error;
        } else if (signupData.role === 'student') {
          const { error } = await supabase.from('students').insert(userData);
          insertError = error;
        } else if (signupData.role === 'parent') {
          const { error } = await supabase.from('parents').insert(userData);
          insertError = error;
        }

        if (insertError) throw insertError;
        console.log("✅ Success: User data inserted into table", userData);
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      console.log("✅ Success: Logged out successfully");
    } catch (error: any) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}