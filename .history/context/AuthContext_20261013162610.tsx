import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type AuthUser = {
  id: string;
  email?: string | null;
  [key: string]: any;
};

type AuthSession = {
  user: AuthUser | null;
  [key: string]: any;
};

type AuthContextType = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(
      ({ data: { session } }: { data: { session: AuthSession | null } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as AuthSession | null);
      setUser(session?.user ?? null);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);