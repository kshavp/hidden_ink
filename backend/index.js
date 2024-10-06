import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
const app = express();
const upload = multer({ dest: 'uploads/' });


app.use(express.json());
app.use(cors());

// Encode message into the image
app.post('/encode', upload.single('image'), async (req, res) => {
  const { message } = req.body;
  const imagePath = req.file.path;
  const outputImagePath = path.join('uploads', `encoded-${req.file.filename}.png`);

// const filename = req.file.filename.split('.')[0]; // Original filename without extension
// const outputImagePaths = [
//     path.join('uploads', `encoded-${filename}.png`),
//     path.join('uploads', `encoded-${filename}.jpeg`),
//     path.join('uploads', `encoded-${filename}.jpg`)];


  try {
      const image = sharp(imagePath);
      const { width, height, channels } = await image.metadata();
      const data = await image.raw().ensureAlpha().toBuffer();

      const messageBuffer = Buffer.from(message + '\0'); // Add null terminator for end of message

      // Encode each character of the message into the image
      for (let i = 0; i < messageBuffer.length; i++) {
          if (i * 8 >= data.length) break; // Prevent overflow
          for (let bit = 0; bit < 8; bit++) {
              const byte = (messageBuffer[i] >> (7 - bit)) & 1; // Get the bit
              data[i * 8 + bit] = (data[i * 8 + bit] & ~1) | byte; // Set the LSB
          }
      }

      await sharp(data, { raw: { width, height, channels } }).toFile(outputImagePath);
      fs.unlinkSync(imagePath); // Clean up original image

      res.json({ message: 'Image encoded successfully', path: outputImagePath });
  } catch (error) {
      console.error('Encoding error:', error);
      res.status(500).json({ error: 'Failed to encode image' });
  }
});


// Decode message from the image
app.post('/decode', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
      const data = await sharp(imagePath).raw().toBuffer();
      const messageBuffer = [];
      let message = '';

      // Read bits from the image data
      for (let i = 0; i < data.length; i += 8) {
          let byte = 0;
          for (let bit = 0; bit < 8; bit++) {
              byte <<= 1;
              byte |= (data[i + bit] & 1); // Read the LSB
          }
          if (byte === 0) break; // Null terminator
          messageBuffer.push(byte);
      }

      message = String.fromCharCode(...messageBuffer);

      fs.unlinkSync(imagePath); // Clean up uploaded image

      res.json({ message: 'Decoded message:', secretMessage: message });
  } catch (error) {
      console.error('Decoding error:', error);
      res.status(500).json({ error: 'Failed to decode image' });
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});