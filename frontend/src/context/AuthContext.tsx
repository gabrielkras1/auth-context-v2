import { createContext, useContext, useState, useEffect} from "react";
import type { ReactNode } from "react";

// Tipagem exigida pelo professor
interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Resolve o problema do Refresh (F5)
  async function validateSession() {
    const token = localStorage.getItem("@Prefeitura:token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("@Prefeitura:token");
      }
    } catch (error) {
      console.error("Erro ao validar sessão:", error);
    } finally {
      // O delay de 2s do backend manterá o isLoading=true por esse tempo
      setIsLoading(false);
    }
  }

  useEffect(() => {
    validateSession();
  }, []);

  async function signIn(username: string, password: string) {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error("Credenciais inválidas");

    const { token } = await response.json();
    localStorage.setItem("@Prefeitura:token", token);
    
    // Busca os dados do usuário logo após o login
    await validateSession();
  }

  function signOut() {
    localStorage.removeItem("@Prefeitura:token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}