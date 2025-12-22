import * as fs from 'fs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync('uploads');
    } catch (error) {}
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    cb(null, uniqueSuffix);
  },
});

export { storage };
