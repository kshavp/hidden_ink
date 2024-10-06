import React from "react";
import Encode from "./components/Encode";
import Decode from "./components/Decode";
import Navbar from "./components/Navbar/Navbar";

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-black">
      <Navbar />
      <div className="my-auto">
        <h1 className="text-white text-5xl font-bold mb-4 text-center">
          Hidden <span className="animate-pulse text-green-700">Ink</span>{" "}
        </h1>
        <p className="text-gray-300 text-lg mx-auto mb-10 max-w-xl font-light text-center">
          Conceal, share and protect classified messages in one click. Decode in
          two.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-5">
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-lg p-6 transition-transform duration-300">
            <Encode />
          </div>
          <div className="bg-neutral-900 border border-gray-700 rounded-lg shadow-lg p-6 transition-transform duration-300">
            <Decode />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
