import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Button } from "@repo/ui/components/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center space-x-8 mb-12">
          <a
            href="https://vite.dev"
            target="_blank"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img
              src={viteLogo}
              className="h-24 w-24 drop-shadow-[0_0_0.6rem_#646cffaa]"
              alt="Vite logo"
            />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            className="hover:scale-110 transition-transform duration-300"
          >
            <img
              src={reactLogo}
              className="h-24 w-24 drop-shadow-[0_0_0.6rem_#61dafbaa]"
              alt="React logo"
            />
          </a>
        </div>

        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Vite + React
        </h1>

        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="bg-gray-800/50 p-8 rounded-xl shadow-xl backdrop-blur-sm">
            <Button
              onClick={() => setCount((count) => count + 1)}
              className="mb-6 text-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full transition-all duration-300 hover:scale-105"
            >
              Count is {count}
            </Button>

            <p className="text-gray-300">
              Edit{" "}
              <code className="text-yellow-300 px-2 py-1 rounded bg-gray-700/50">
                src/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
          </div>

          <p className="text-gray-400 italic">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
