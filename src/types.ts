export interface UserProfile {
  id: string;
  role: 'faculty' | 'student' | 'parent';
  name: string;
  email?: string;
  roll_no?: string;
  standard?: string;
  class?: string;
  linked_student_roll?: string;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface SignUpData {
  role: 'faculty' | 'student' | 'parent';
  full_name: string;
  email: string;
  password: string;
}