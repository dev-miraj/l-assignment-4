import React, { useEffect, useState } from "react";
import logo from "./assets/logo.svg";
import CreatePage from "./components/CreatePage";
import DownloadPage from "./components/DownloadPage";
import "./index.css";
function App() {
  // State for routing
  const [route, setRoute] = useState("create");

  // State for downloaded images
  const [downloadedImages, setDownloadedImages] = useState([]);

  // Load downloaded images from localStorage on initial render
  useEffect(() => {
    const savedImages = localStorage.getItem("downloadedImages");
    if (savedImages) {
      setDownloadedImages(JSON.parse(savedImages));
    }
  }, []);

  // Save downloaded images to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("downloadedImages", JSON.stringify(downloadedImages));
  }, [downloadedImages]);

  // Add image to downloaded images list (avoiding duplicates)
  const addToDownloaded = (image) => {
    setDownloadedImages((prevImages) => {
      // Check if image already exists in the array
      const exists = prevImages.some((img) => img.id === image.id);
      if (exists) {
        return prevImages; // Return unchanged array if image already exists
      }
      return [...prevImages, image]; // Add new image to array
    });
  };

  return (
    <div className="min-h-screen bg-color text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12">
          <img src={logo} />
          <nav className="flex space-x-1">
            <button
              onClick={() => setRoute("create")}
              className={`px-4 py-2 rounded-md ${
                route === "create" ? "bg-zinc-800" : "hover:bg-zinc-900"
              }`}
            >
              Create Image
            </button>
            <button
              onClick={() => setRoute("download")}
              className={`px-4 py-2 rounded-md ${
                route === "download" ? "bg-zinc-800" : "hover:bg-zinc-900"
              }`}
            >
              Downloaded
            </button>
          </nav>
        </header>

        {/* Conditional Rendering based on route */}
        {route === "create" && <CreatePage addToDownloaded={addToDownloaded} />}
        {route === "download" && (
          <DownloadPage downloadedImages={downloadedImages} />
        )}
      </div>
    </div>
  );
};

export default App;
