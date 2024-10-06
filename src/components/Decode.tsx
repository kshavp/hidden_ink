import React, { useState } from "react";
import axios from "axios";

const Decode: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleDecode = async () => {
    if (!image) {
      setError("Image is required for decoding!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/decode`,
        formData
      );
      setDecodedMessage(response.data.message);
      setError(null);
    } catch (err) {
      setError("Failed to decode image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Decode Image</h2>
      {error && <p className="text-red-400">{error}</p>}
      <input
        type="file"
        accept=".jpg,.png"
        onChange={handleImageChange}
        className="mb-4 border border-gray-800 rounded p-2 w-full bg-gray-900 text-white focus:outline-none focus:ring focus:ring-indigo-500"
      />
      <button
        onClick={handleDecode}
        className="border-2 border-opacity-25 border-green-500 relative inline-flex items-center justify-center px-10 py-4 overflow-hidden font-mono font-medium tracking-tighter text-white bg-gray-800 rounded-lg group"
        disabled={loading}
      >
        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-green-500 rounded-full group-hover:w-56 group-hover:h-56"></span>
        <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-700"></span>
        <span className="relative">{loading ? "Decoding..." : "Decode"}</span>
      </button>
      {decodedMessage && (
        <div className="mt-4 text-white">
          <h3 className="font-bold">Decoded Message:</h3>
          <p>{decodedMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Decode;
