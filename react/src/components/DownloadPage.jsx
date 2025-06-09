import React from 'react';

const DownloadPage = ({ downloadedImages }) => {
  return (
    <main className="relative z-10">
      <h2 className="text-4xl font-bold mb-8">Your Downloaded Images</h2>
      
      {downloadedImages.length === 0 ? (
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 text-center">
          <p className="text-zinc-400 text-lg">You haven't downloaded any images yet.</p>
          <p className="text-zinc-500 mt-2">Go to the Create Image page to generate and download images.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {downloadedImages.map((image) => (
            <div key={image.id} className="image-card rounded-xl overflow-hidden relative">
              <img 
                src={image.url} 
                alt={`Generated from prompt: ${image.prompt}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-sm text-white truncate">{image.prompt}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-zinc-400">{image.model}</span>
                  <span className="text-xs text-zinc-400">{image.width}x{image.height}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default DownloadPage;