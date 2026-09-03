import multer from "multer";

const storage = multer.memoryStorage();

const csvUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      return cb(null, true);
    }
    cb(new Error("Only CSV files are accepted."));
  },
});

export { csvUpload };