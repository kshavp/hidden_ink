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

  try {
      const image = sharp(imagePath);
      const { width, height, channels } = await image.metadata();
      const data = await image.raw().ensureAlpha().toBuffer();

      const messageBuffer = Buffer.from(message + '\0'); // Add null terminator for end of message
      let messageIndex = 0;

      // Encode each character of the message into the image
      for (let i = 0; i < data.length && messageIndex < messageBuffer.length; i++) {
          for (let bit = 0; bit < 8; bit++) {
              if (messageIndex >= messageBuffer.length) break; // Prevent overflow
              const byte = (messageBuffer[messageIndex] >> (7 - bit)) & 1; // Get the bit
              data[i] = (data[i] & ~1) | byte; // Set the LSB
              if (bit === 7) messageIndex++; // Move to next byte after 8 bits
          }
      }

      await sharp(data, { raw: { width, height, channels } }).toFile(outputImagePath);
      fs.unlinkSync(imagePath); // Clean up original image

      // Return path for downloading the encoded image
      res.json({ message: 'Image encoded successfully', path: outputImagePath });
  } catch (error) {
      console.error('Encoding error:', error);
      res.status(500).json({ error: 'Failed to encode image' });
  }
});

app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath, (err) => {
      if (err) {
          console.error('Download error:', err);
          res.status(500).send('Could not download the file.');
      }
  });
});

// Decode message from the image
app.post('/decode', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;

  try {
      const data = await sharp(imagePath).raw().toBuffer();
      const messageBuffer = [];
      let byte = 0;
      let count = 0;

      // Read bits from the image data
      for (let i = 0; i < data.length; i++) {
          byte <<= 1; // Shift left to make space for the next bit
          byte |= (data[i] & 1); // Read the LSB
          count++;

          if (count === 8) {
              if (byte === 0) break; // Null terminator
              messageBuffer.push(byte);
              byte = 0; // Reset for next byte
              count = 0; // Reset bit count
          }
      }

      const message = String.fromCharCode(...messageBuffer);

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
