import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useState } from "react";

export function Admin() {
  const { user, signOut } = useAuth();
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await api.get("/me");
      setTestResponse(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      setTestResponse(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Painel Administrativo</h1>
      <p>Usuário logado: <strong>{user?.username}</strong></p>
      <p>Cargo: <strong>{user?.role}</strong></p>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={testApi} disabled={loading}>
          {loading ? "Testando..." : "Testar Requisição Protegida"}
        </button>
        <button onClick={signOut} style={{ backgroundColor: "#ff4d4d", color: "white" }}>
          Sair
        </button>
      </div>

      {testResponse && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "5px" }}>
          <h3>Resultado do Teste:</h3>
          <pre>{testResponse}</pre>
        </div>
      )}
      
      <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#666" }}>
        Dica: O Access Token expira em 30 segundos. Aguarde 30s e clique no botão para ver o Silent Refresh em ação no Console do Navegador (aba Network).
      </p>
    </div>
  );
}
