import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";

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
      const response = await api.get("/me");
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao validar sessão:", error);
      // Se der erro aqui (ex: 401 e refresh falhou), o interceptor redirecionará para login
      localStorage.removeItem("@Prefeitura:token");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    validateSession();
  }, []);

  async function signIn(username: string, password: string) {
    try {
      const response = await api.post("/login", { username, password });
      const { token } = response.data;

      localStorage.setItem("@Prefeitura:token", token);
      
      // Busca os dados do usuário logo após o login
      await validateSession();
    } catch (error) {
      throw new Error("Credenciais inválidas");
    }
  }

  async function signOut() {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Erro ao fazer logout no servidor", err);
    } finally {
      localStorage.removeItem("@Prefeitura:token");
      setUser(null);
    }
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
