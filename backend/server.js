const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173", // Ajuste conforme a porta do seu frontend
    credentials: true
} ));

const PORT = 3000;
const ACCESS_SECRET = "acesso_segredo";
const REFRESH_SECRET = "refresh_segredo";

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

    const accessToken = jwt.sign(
        { id: USER.id, username: USER.username },
        ACCESS_SECRET,
        { expiresIn: "30s" } // Expiração curta para teste
    );

    const refreshToken = jwt.sign(
        { id: USER.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    // Guardar Refresh Token em Cookie Seguro
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Em produção deve ser true
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    } );

    res.json({ token: accessToken });
});

// REFRESH TOKEN
app.post("/refresh", (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token não encontrado" });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        
        // Em uma app real, buscaríamos o usuário no banco aqui
        const newAccessToken = jwt.sign(
            { id: USER.id, username: USER.username },
            ACCESS_SECRET,
            { expiresIn: "30s" }
        );

        res.json({ token: newAccessToken });
    } catch (err) {
        return res.status(401).json({ message: "Refresh Token inválido ou expirado" });
    }
});

// LOGOUT (para limpar o cookie)
app.post("/logout", (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logout realizado" });
});

// ROTA PROTEGIDA
app.get("/me", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não enviado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);
        
        // Simulação de delay de 2 segundos solicitada
        setTimeout(() => {
            res.json({
                id: USER.id,
                username: USER.username,
                role: USER.role
            });
        }, 2000);

    } catch (err) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
});

app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
