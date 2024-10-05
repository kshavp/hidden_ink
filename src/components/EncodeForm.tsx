import React, { useState } from "react";
import axios from "axios";

const EncodeForm: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !message) {
      alert("Please provide an image and a message");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("message", message);

    try {
      const response = await axios.post(
        "http://localhost:5000/encode",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Encoded successfully: " + response.data.path);
    } catch (error) {
      console.error("Error encoding image:", error);
      alert("Failed to encode image");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Upload Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <div>
        <label>Secret Message:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <button type="submit">Encode</button>
    </form>
  );
};

export default EncodeForm;
