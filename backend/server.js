const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
const SECRET = "segredo_super";

const USER = {
    id: 1,
    username: "admin",
    password: "123456",
    role: "Software Manager"
};

// LOGIN
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username !== USER.username || password !== USER.password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
        { id: USER.id, username: USER.username },
        SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});

// ROTA PROTEGIDA COM DELAY
app.get("/me", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não enviado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        
        // Simulação de delay de 2 segundos solicitada
        setTimeout(() => {
            res.json({
                id: USER.id,
                username: USER.username,
                role: USER.role
            });
        }, 2000);

    } catch {
        return res.status(401).json({ message: "Token inválido" });
    }
});

app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));