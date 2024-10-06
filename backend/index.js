const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;


//Middleware
app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Convert message to binary format
function messageToBinary(message) {
  return message
    .split("")
    .map(char => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

//Encode the message into the image
function encodeMessageInImage(imageBuffer, message) {
  const binaryMessage = messageToBinary(message);
  const messageLength = binaryMessage.length.toString(2).padStart(32, "0"); // 32-bit message length

  let imageArray = new Uint8Array(imageBuffer);

  //Encode message length into first 32 bits
  for (let i = 0; i < messageLength.length; i++) {
    imageArray[i] = (imageArray[i] & 0xFE) | parseInt(messageLength[i], 10); // Modify LSB with message length
  }

  //Encode message into image starting after the 32 bits
  for (let i = 0; i < binaryMessage.length; i++) {
    imageArray[i + 32] = (imageArray[i + 32] & 0xFE) | parseInt(binaryMessage[i], 10); // Modify LSB with message
  }

  return Buffer.from(imageArray);
}

//Decode the message from the image
function decodeMessageFromImage(imageBuffer) {
  const imageArray = new Uint8Array(imageBuffer);

  //Extract message length from first 32 bits
  let binaryLength = '';
  for (let i = 0; i < 32; i++) {
    binaryLength += (imageArray[i] & 1).toString(); // Extract LSB to get message length
  }

  const messageLength = parseInt(binaryLength, 2); // Convert Binary to Decimal

  // Extract message based on message length
  let binaryMessage = '';
  for (let i = 0; i < messageLength; i++) {
    binaryMessage += (imageArray[i + 32] & 1).toString(); // Extract LSB for the message
  }

  const message = binaryMessage.match(/.{1,8}/g) // Split binary message into 8-bit chunks
    .map(byte => String.fromCharCode(parseInt(byte, 2))) // Convert binary to string
    .join('');

  return message;
}

// ENCODING OF IMAGE WITH SECRET TEXT
app.post('/encode', upload.single('image'), (req, res) => {
  const message = req.body.message;
  const imageBuffer = req.file.buffer;

  if (!message || !imageBuffer) {
    return res.status(400).json({ error: 'Message and image are required!' });
  }

  try {
    const encodedImage = encodeMessageInImage(imageBuffer, message);
    
    const tempFilePath = path.join(__dirname, 'encoded_image.png');
    fs.writeFileSync(tempFilePath, encodedImage);

    res.download(tempFilePath, 'encoded_image.png', (err) => {
      if (err) {
        console.error('Download error:', err);
        return res.status(500).json({ error: 'Failed to download encoded image' });
      }

      // File Deletion
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error('Encoding error:', error);
    res.status(500).json({ error: 'Failed to encode message in image' });
  }
});

// DECODING THE IMAGE
app.post('/decode', upload.single('image'), (req, res) => {
  const imageBuffer = req.file.buffer;

  if (!imageBuffer) {
    return res.status(400).json({ error: 'Image is required for decoding!' });
  }

  try {
    const hiddenMessage = decodeMessageFromImage(imageBuffer);
    console.log(hiddenMessage);
    res.json({ message: hiddenMessage });
  } catch (error) {
    console.error('Decoding error:', error);
    res.status(500).json({ error: 'Failed to decode message from image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
