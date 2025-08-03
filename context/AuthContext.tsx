import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: 'faculty' | 'student' | 'parent') => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
}

interface SignupData {
  role: 'faculty' | 'student' | 'parent';
  name: string;
  email?: string;
  password: string;
  roll_no?: string;
  standard?: string;
  class?: string;
  linked_student_roll?: string;
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
          // Fetch user profile based on role
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Try faculty first
      const { data: faculty } = await supabase
        .from('faculty')
        .select('*')
        .eq('id', userId)
        .single();

      if (faculty) {
        setUser({ ...faculty, role: 'faculty' });
        return;
      }

      // Then try users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        setUser(userData);
        return;
      }

      // Then try parents
      const { data: parent } = await supabase
        .from('parents')
        .select('*')
        .eq('id', userId)
        .single();

      if (parent) {
        setUser({ ...parent, role: 'parent' });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string, role: 'faculty' | 'student' | 'parent') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email || `${signupData.roll_no || Date.now()}@temp.com`,
        password: signupData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Insert into appropriate table based on role
        if (signupData.role === 'faculty') {
          await supabase.from('faculty').insert({
            id: data.user.id,
            name: signupData.name,
            email: signupData.email!,
          });
        } else if (signupData.role === 'student') {
          await supabase.from('students').insert({
            id: data.user.id,
            roll_no: signupData.roll_no!,
            name: signupData.name,
            standard: signupData.standard!,
            class: signupData.class!,
          });

          await supabase.from('users').insert({
            id: data.user.id,
            role: 'student',
            name: signupData.name,
            roll_no: signupData.roll_no!,
            class: signupData.class!,
            password_hash: 'hashed', // In real app, hash properly
          });
        } else if (signupData.role === 'parent') {
          await supabase.from('parents').insert({
            id: data.user.id,
            name: signupData.name,
            linked_student_roll: signupData.linked_student_roll!,
            password_hash: 'hashed',
          });

          await supabase.from('users').insert({
            id: data.user.id,
            role: 'parent',
            name: signupData.name,
            password_hash: 'hashed',
          });
        }
      }

      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
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