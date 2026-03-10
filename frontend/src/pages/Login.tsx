import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await signIn(username, password);
      navigate("/admin");
    } catch (err) {
      setError("Usuário ou senha incorretos.");
    }
  }

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto' }}>
      <h2>Login Administrativo</h2>
      <form onSubmit={handleLogin}>
        <input 
          placeholder="Usuário" 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        /><br/>
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        /><br/>
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}