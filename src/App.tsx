import React, { useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [decodedMessage, setDecodedMessage] = useState<string>('');
  const [encodedImagePath, setEncodedImagePath] = useState<string | null>(null); // State for encoded image path

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleEncode = async () => {
    if (!image) return;
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('message', message);

    try {
      const response = await axios.post('http://localhost:3000/encode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message);
      setEncodedImagePath(response.data.path); // Set the path of the encoded image
    } catch (error) {
      console.error('Error encoding image:', error);
    }
  };

  const handleDecode = async () => {
    if (!image) return;
    
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:3000/decode', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDecodedMessage(response.data.secretMessage);
    } catch (error) {
      console.error('Error decoding image:', error);
    }
  };

  const downloadImage = () => {
    if (encodedImagePath) {
      // Trigger download
      const link = document.createElement('a');
      link.href = `http://localhost:3000/${encodedImagePath}`;
      link.setAttribute('download', `encoded-${image?.name}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Steganography</h1>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mt-2 mb-4 p-2 border"
      />
      <div className="flex space-x-2">
        <button onClick={handleEncode} className="bg-blue-500 text-white p-2 rounded">
          Encode
        </button>
        <button onClick={handleDecode} className="bg-green-500 text-white p-2 rounded">
          Decode
        </button>
      </div>

      {encodedImagePath && (
        <div className="mt-4">
          <button onClick={downloadImage} className="bg-yellow-500 text-white p-2 rounded">
            Download Encoded Image
          </button>
        </div>
      )}

      {decodedMessage && (
        <div className="mt-4">
          <h2 className="text-xl">Decoded Message:</h2>
          <p>{decodedMessage}</p>
        </div>
      )}
    </div>
  );
};

export default App;
