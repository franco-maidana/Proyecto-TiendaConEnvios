import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurar que la carpeta exista
const dir = './uploads/productos';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, tiposPermitidos.test(ext));
};

const upload = multer({ storage, fileFilter });

export default upload;
