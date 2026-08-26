import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        status: "OK",
        application: "EcoTrack API",
        version: "1.0.0"
    });
});

app.listen(PORT, () => {
    console.log(`🚀 EcoTrack API avviata sulla porta ${PORT}`);
});