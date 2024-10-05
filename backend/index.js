import express from 'express';
import multer from 'multer';
import { Jimp } from 'jimp';
import path from 'path';

const app = express();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Image Steganography Backend');
});

// Encode Route
app.post('/encode', upload.single('image'), async (req, res) => {
  const message = req.body.message;
  const imagePath = req.file.path;

  try {
    const image = await Jimp.read(imagePath);
    // Basic encoding logic (for now just changing pixel data)
    for (let i = 0; i < message.length; i++) {
      image.setPixelColor(Jimp.cssColorToHex('white'), i, 0); // Example, replace with actual encoding logic
    }
    const outputPath = 'uploads/encoded_' + req.file.filename;
    await image.writeAsync(outputPath);
    res.json({ message: 'Encoded successfully', path: outputPath });
  } catch (error) {
    res.status(500).json({ error: 'Error encoding image' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
