import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

let messages = [];

router.post("/", (req, res) => {
    const { content, sender, type, timestamp } = req.body;

    if (!content || !sender || !type) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const message = {
        id: uuidv4(),
        content,
        sender,
        type,
        timestamp: timestamp || new Date().toISOString(),
    };

    messages.push(message);

    const data = {
        situation: "success",
        message
    };

    res.status(201).json(data);
});

router.get("/", (req, res) => {
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    res.json(sortedMessages);
});

export default router;
