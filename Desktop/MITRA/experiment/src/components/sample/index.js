import React, { useEffect, useState } from 'react';

const Sample = () => {
  const [canvas, setCanvas] = useState(null);
  const [mode, setMode] = useState('portrait'); // Mode: portrait or landscape
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 }); // Initial size for portrait mode
  const [images, setImages] = useState([]); // Store images for preview
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog for preview

  // Function to set canvas size based on screen width and mode (portrait/landscape)
  const adjustCanvasSize = (mode) => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 576) {
      if (mode === 'portrait') {
        setCanvasSize({ width: 300, height: 500 });
      } else {
        setCanvasSize({ width: 500, height: 300 });
      }
    } else {
      if (mode === 'portrait') {
        setCanvasSize({ width: 500, height: 500 });
      } else {
        setCanvasSize({ width: 700, height: 500 });
      }
    }
  };

  // Initialize canvas when component mounts and adjust size dynamically
  useEffect(() => {
    const fabricCanvas = new window.fabric.Canvas('canvas', {
      backgroundColor: '#f3f3f3',
    });

    setCanvas(fabricCanvas);
    adjustCanvasSize(mode);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Resize canvas when mode or size changes
  useEffect(() => {
    if (canvas) {
      canvas.setWidth(canvasSize.width);
      canvas.setHeight(canvasSize.height);
      canvas.renderAll();
    }
  }, [canvas, canvasSize]);

  // Adjust canvas size when window resizes
  useEffect(() => {
    const handleResize = () => adjustCanvasSize(mode);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  // Handle file upload and store images in array for preview
  const handleAddImage = (event) => {
    const files = Array.from(event.target.files);

    // Create an array of base64 image URLs for preview
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((base64Images) => {
      setImages((prevImages) => [...prevImages, ...base64Images]); // Add to existing images array
      setIsDialogOpen(true); // Open the dialog for preview
    });
  };
  // Add all images to the canvas in a neat grid layout
  const handleAddImagesToCanvas = () => {
    if (canvas && images.length) {
      const numImages = images.length;
      const rows = Math.ceil(Math.sqrt(numImages)); // Create a square-like grid
      const cols = Math.ceil(numImages / rows);
      const imageWidth = canvasSize.width / cols;
      const imageHeight = canvasSize.height / rows;

      images.forEach((src, index) => {
        window.fabric.Image.fromURL(src, (fabricImg) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          fabricImg.set({
            left: col * imageWidth,
            top: row * imageHeight,
            scaleX: imageWidth / fabricImg.width,
            scaleY: imageHeight / fabricImg.height,
            selectable: true,
          });
          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
        });
      });
      setImages([]); // Clear images after adding to canvas
      setIsDialogOpen(false); // Close dialog
    }
  };

  // Delete the selected image from the canvas
  const handleDeleteImage = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    }
  };

  // Handle mode change (portrait/landscape)
  const handleModeChange = (newMode) => {
    setMode(newMode);
    adjustCanvasSize(newMode);
  };

  // Convert canvas to image and trigger download
  const handleExportAsImage = () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'canvas-image.png';
      link.click();
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Photo Page Editor</h1>

      {/* Mode Selection */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={() => handleModeChange('portrait')}
          style={{
            padding: '10px',
            backgroundColor: mode === 'portrait' ? '#007BFF' : '#ccc',
            color: '#fff',
            marginRight: '10px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Portrait
        </button>
        <button
          onClick={() => handleModeChange('landscape')}
          style={{
            padding: '10px',
            backgroundColor: mode === 'landscape' ? '#007BFF' : '#ccc',
            color: '#fff',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Landscape
        </button>
      </div>

      {/* Canvas area */}
      <canvas
        id="canvas"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ border: '1px solid #ccc' }}
      />

      {/* Buttons for adding images */}
      <div style={{ marginTop: '20px' }}>
        <label
          htmlFor="upload-image"
          style={{
            cursor: 'pointer',
            padding: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            borderRadius: '5px',
            marginRight: '10px',
          }}
        >
          Add Image
        </label>
        <input
          type="file"
          id="upload-image"
          style={{ display: 'none' }}
          onChange={handleAddImage}
          accept="image/*"
          multiple // Allow multiple image uploads
        />

        {/* Button to delete selected image */}
        <button
          onClick={handleDeleteImage}
          style={{
            padding: '10px',
            backgroundColor: '#dc3545',
            color: '#fff',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Delete Selected Image
        </button>

        {/* Button to export canvas as image */}
        <button
          onClick={handleExportAsImage}
          style={{
            padding: '10px',
            backgroundColor: '#28a745',
            color: '#fff',
            borderRadius: '5px',
            border: 'none',
            marginLeft: '10px',
            cursor: 'pointer',
          }}
        >
          Export as Image
        </button>
      </div>

      {/* Dialog box for previewing images */}
      {isDialogOpen && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Image Preview</h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Preview ${index}`}
                style={{ width: '100px', height: '100px', margin: '5px' }}
              />
            ))}
          </div>
          <button
            onClick={handleAddImagesToCanvas}
            style={{
              padding: '10px',
              backgroundColor: '#007BFF',
              color: '#fff',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Add All Images to Canvas
          </button>
        </div>
      )}
    </div>
  );
};

export default Sample;
