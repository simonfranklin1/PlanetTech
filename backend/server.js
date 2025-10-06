import express from "express";
import cors from "cors";
import messagesRouter from "./routes/messages.js";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

app.use("/messages", messagesRouter);
app.use("/upload", uploadRouter);

app.listen(PORT, () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
