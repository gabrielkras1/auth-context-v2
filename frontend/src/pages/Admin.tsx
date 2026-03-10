import { useAuth } from "../context/AuthContext";

export function Admin(){

  const { user } = useAuth()

  return (

    <div>

      <h1>Painel Administrativo</h1>

      <p>Usuário logado:</p>

      <p>{user?.username}</p>

      <p>Cargo: {user?.role}</p>

    </div>
  )
}