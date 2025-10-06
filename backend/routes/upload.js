import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

export default router;
