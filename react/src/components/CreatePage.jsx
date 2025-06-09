import { useEffect, useState } from 'react';

const CreatePage = ({ addToDownloaded }) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('flux');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000000));

  // Fetch available models when component mounts
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://image.pollinations.ai/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error('Error fetching models:', error);
        setError('Failed to load models. Please try again later.');
      }
    };

    fetchModels();
  }, []);

  // Generate a new random seed
  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000000));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImages([]);
    generateRandomSeed();

    try {
      // Generate 9 images with different seeds
      const imagePromises = Array(9)
        .fill()
        .map((_, index) => {
          const imageSeed = seed + index;
          return generateImage(prompt, selectedModel, width, height, imageSeed);
        });

      const results = await Promise.allSettled(imagePromises);
      
      const newImages = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return {
            id: `${Date.now()}-${index}`,
            url: result.value,
            prompt,
            seed: seed + index,
            model: selectedModel,
            width,
            height,
            error: null
          };
        } else {
          return {
            id: `${Date.now()}-${index}`,
            url: null,
            prompt,
            seed: seed + index,
            model: selectedModel,
            width,
            height,
            error: 'Failed to load image'
          };
        }
      });

      setImages(newImages);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate a single image
  const generateImage = (prompt, model, width, height, seed) => {
    return new Promise((resolve, reject) => {
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&width=${width}&height=${height}&seed=${seed}&nologo=true`;
      
      // Set a timeout to reject the promise if it takes too long
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, 30000); // 30 seconds timeout

      // Create an image element to load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(url);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  // Handle aspect ratio preset selection
  const handleRatioPreset = (ratio) => {
    switch (ratio) {
      case '1:1':
        setWidth(1024);
        setHeight(1024);
        break;
      case '16:9':
        setWidth(1920);
        setHeight(1080);
        break;
      case '4:3':
        setWidth(1024);
        setHeight(768);
        break;
      case '3:2':
        setWidth(1200);
        setHeight(800);
        break;
      default:
        break;
    }
  };

  // Handle image download
  const handleDownload = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `ai-image-${image.seed}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Add to downloaded images
      addToDownloaded(image);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  return (
    <main className="relative z-10">
      {/* Welcome Message */}
      <h2 className="text-4xl font-bold mb-8">Let's create a masterpiece! <span className="text-2xl">👋</span></h2>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative mb-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="pl-5 pr-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Create with Prompts"
            className="outline-none w-full py-4 px-2 bg-transparent text-white placeholder-zinc-400 text-lg"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-zinc-800 hover:bg-zinc-700 transition-colors p-4 mr-1 rounded-full"
            disabled={loading}
          >
            <svg className="w-6 h-6 text-white transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
            </svg>
          </button>
        </div>
      </form>

      {/* Settings Panel */}
      <div className="border border-zinc-700/70 mb-6 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Advanced Settings</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-zinc-700 mb-1">Model</label>
            <select 
              id="model"
              className="w-full px-3 py-2 bg-zinc-900/10 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.length > 0 ? (
                models.map((model) => (
                  <option key={model} value={model} className="bg-zinc-900">{model}</option>
                ))
              ) : (
                <option value="flux" className="bg-zinc-900">Flux</option>
              )}
            </select>
          </div>

          {/* Seed Input */}
          <div>
            <label htmlFor="seed" className="block text-sm font-medium text-zinc-700 mb-1">Seed (for reproducible results)</label>
            <input 
              type="number" 
              id="seed" 
              disabled={true}
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={seed}
              placeholder="Random"
            />
          </div>

          {/* Width Input */}
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-zinc-700 mb-1">Width</label>
            <input 
              type="number" 
              id="width" 
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min="16"
              max="2048"
            />
          </div>

          {/* Height Input */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-zinc-700 mb-1">Height</label>
            <input 
              type="number" 
              id="height" 
              className="w-full bg-zinc-900/10 px-3 py-2 border border-zinc-700/70 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="16"
              max="2048"
            />
          </div>

          {/* Aspect Ratio Presets */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Aspect Ratio Presets</label>
            <div className="flex flex-wrap gap-2">
              <button 
                type="button"
                className="bg-zinc-900/10 px-3 py-3 text-xs hover:bg-zinc-800 rounded transition-colors"
                onClick={() => handleRatioPreset('1:1')}
              >1:1</button>
              <button 
                type="button"
                className="bg-zinc-900/10 px-3 py-3 text-xs hover:bg-zinc-800 rounded transition-colors"
                onClick={() => handleRatioPreset('16:9')}
              >16:9</button>
              <button 
                type="button"
                className="bg-zinc-900/10 px-3 py-3 text-xs hover:bg-zinc-800 rounded transition-colors"
                onClick={() => handleRatioPreset('4:3')}
              >4:3</button>
              <button 
                type="button"
                className="bg-zinc-900/10 px-3 py-3 text-xs hover:bg-zinc-800 rounded transition-colors"
                onClick={() => handleRatioPreset('3:2')}
              >3:2</button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center mb-6 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="ml-4">Generating images...</p>
        </div>
      )}

      {/* Image Results Section */}
      {images.length > 0 && (
        <div>
          <h3 className="text-zinc-200 mb-4 font-bold text-lg">Result</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="image-card rounded-xl overflow-hidden cursor-pointer relative">
                {image.url ? (
                  <>
                    <div 
                      className="absolute bottom-2 right-2 p-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleDownload(image)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-down-icon lucide-image-down">
                        <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"/>
                        <path d="m14 19 3 3v-5.5"/>
                        <path d="m17 22 3-3"/>
                        <circle cx="9" cy="9" r="2"/>
                      </svg>
                    </div>
                    <img 
                      src={image.url} 
                      alt={`Generated from prompt: ${image.prompt}`}
                      className="w-full h-48 object-cover"
                    />
                  </>
                ) : (
                  <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <p>Unable to load image</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default CreatePage;