import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, AuthContextType, SignUpData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    console.debug('🔄 Auth: Initializing auth state check');

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.debug('❌ Auth: Session error:', sessionError);
          throw sessionError;
        }

        if (mounted) {
          if (session?.user) {
            console.debug('✅ Auth: Found existing session for user:', session.user.id);
            setUser(session.user);
            await fetchUserProfile(session.user);
          } else {
            console.debug('ℹ️ Auth: No existing session found');
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (err: any) {
        console.debug('❌ Auth: Initialize error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug('🔄 Auth: State change event:', event, 'Session:', session?.user?.id || 'none');
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.debug('✅ Auth: User signed in:', session.user.id);
        setUser(session.user);
        setError(null);
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.debug('✅ Auth: User signed out');
        setUser(null);
        setProfile(null);
        setError(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.debug('🧹 Auth: Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      console.debug('🔄 Auth: Fetching user profile for:', authUser.id);
      const role = authUser.user_metadata?.role;
      
      if (!role) {
        console.debug('❌ Auth: No role found in user metadata');
        setError('No role found in user profile');
        return;
      }

      console.debug('🔄 Auth: User role detected:', role);
      
      let tableName = '';
      switch (role) {
        case 'faculty':
          tableName = 'faculty';
          break;
        case 'student':
          tableName = 'students';
          break;
        case 'parent':
          tableName = 'parents';
          break;
        default:
          console.debug('❌ Auth: Invalid role:', role);
          setError('Invalid user role');
          return;
      }

      console.debug('🔄 Auth: Querying table:', tableName, 'for user ID:', authUser.id);
      
      const { data, error: profileError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.debug('❌ Auth: Profile query error:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
          table: tableName,
          userId: authUser.id
        });

        if (profileError.code === 'PGRST116') {
          console.debug(`❌ Auth: No rows found for user ${authUser.id} in ${role} table`);
          setError('No profile found. Please contact admin.');
          setProfile(null);
          return;
        }
        
        throw profileError;
      }

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          role: role,
          name: data.name || data.full_name,
          email: data.email,
          roll_no: data.roll_no,
          standard: data.standard,
          class: data.class,
          linked_student_roll: data.linked_student_roll
        };
        
        console.debug('✅ Auth: Profile loaded successfully:', userProfile);
        setProfile(userProfile);
        setError(null);
      }
    } catch (err: any) {
      console.debug('❌ Auth: Fetch profile error:', err);
      setError(err.message);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    console.debug('🔄 Auth: SignUp called with:', { email, role: userData.role, name: userData.full_name });
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (signUpError) {
        console.debug('❌ Auth: SignUp error:', signUpError);
        throw signUpError;
      }

      console.debug('✅ Auth: SignUp successful:', data.user?.id);

      if (data.user) {
        let tableName = '';
        switch (userData.role) {
          case 'faculty':
            tableName = 'faculty';
            break;
          case 'student':
            tableName = 'students';
            break;
          case 'parent':
            tableName = 'parents';
            break;
        }

        console.debug('🔄 Auth: Inserting user into table:', tableName);

        const insertData = {
          id: data.user.id,
          name: userData.full_name,
          full_name: userData.full_name,
          email: userData.email,
          created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from(tableName)
          .insert(insertData);

        if (insertError) {
          console.debug('❌ Auth: Insert error:', {
            code: insertError.code,
            message: insertError.message,
            table: tableName,
            data: insertData
          });
          throw insertError;
        }

        console.debug('✅ Auth: User inserted into table successfully');
      }

      return data;
    } catch (err: any) {
      console.debug('❌ Auth: SignUp failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.debug('🔄 Auth: SignIn called with email:', email);
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.debug('❌ Auth: SignIn error:', signInError);
        throw signInError;
      }

      console.debug('✅ Auth: SignIn successful:', data.user?.id);
      return data;
    } catch (err: any) {
      console.debug('❌ Auth: SignIn failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.debug('🔄 Auth: SignOut called');
    setLoading(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.debug('❌ Auth: SignOut error:', signOutError);
        throw signOutError;
      }

      console.debug('✅ Auth: SignOut successful');
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (err: any) {
      console.debug('❌ Auth: SignOut failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!profile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}