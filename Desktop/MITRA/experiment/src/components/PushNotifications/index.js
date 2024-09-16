import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

// Constants for A4 size
const A4_WIDTH_MM = 210; // A4 width in mm
const A4_HEIGHT_MM = 297; // A4 height in mm
const A4_IMAGE_WIDTH = 595; // A4 width in pixels at 72 DPI
const A4_IMAGE_HEIGHT = 842; // A4 height in pixels at 72 DPI
const PADDING = 10; // Padding between images
const MAX_IMAGES_PER_PAGE = 6; // Max number of images per A4 page

const A4ImagePrinter = () => {
  const [images, setImages] = useState([]);
  const [imagePositions, setImagePositions] = useState([]);
  const canvasRef = useRef(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  };

  // Arrange images on canvas
  const arrangeImages = () => {
    const newImagePositions = [];
    const imgWidth = (A4_IMAGE_WIDTH - 3 * PADDING) / 2; // Two images per row with padding
    const imgHeight = (A4_IMAGE_HEIGHT - 4 * PADDING) / 3; // Three images per column with padding

    let x = PADDING;
    let y = PADDING;
    let currentPage = 1;

    images.forEach((_, index) => {
      if (index > 0 && index % MAX_IMAGES_PER_PAGE === 0) {
        currentPage += 1;
        x = PADDING;
        y = PADDING;
      }

      newImagePositions.push({ x, y, width: imgWidth, height: imgHeight, page: currentPage });

      x += imgWidth + PADDING;
      if (x + imgWidth > A4_IMAGE_WIDTH) {
        x = PADDING;
        y += imgHeight + PADDING;
      }
    });

    setImagePositions(newImagePositions);
  };

  // Draw images on canvas
  useEffect(() => {
    arrangeImages();
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (canvas && ctx && images.length > 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      images.forEach((image, index) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
          const position = imagePositions[index];
          if (position && position.page === pageIndex + 1) {
            const { x, y, width, height } = position;
            ctx.drawImage(img, x, y, width, height);
          }
        };
      });
    }
  }, [imagePositions, images, pageIndex]);

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');

    let currentPage = 1;
    images.forEach((image, index) => {
      const img = new Image();
      img.src = image;

      img.onload = () => {
        const position = imagePositions[index];

        if (position.page !== currentPage) {
          doc.addPage(); // Add new page for next images
          currentPage = position.page;
        }

        doc.addImage(
          img,
          'JPEG',
          (position.x / A4_IMAGE_WIDTH) * A4_WIDTH_MM,
          (position.y / A4_IMAGE_HEIGHT) * A4_HEIGHT_MM,
          (position.width / A4_IMAGE_WIDTH) * A4_WIDTH_MM,
          (position.height / A4_IMAGE_HEIGHT) * A4_HEIGHT_MM
        );

        // Save PDF after all images are added
        if (index === images.length - 1) {
          doc.save('images.pdf');
        }
      };
    });
  };

  // Pagination for canvas preview
  const handleNextPage = () => {
    if ((pageIndex + 1) * MAX_IMAGES_PER_PAGE < images.length) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  return (
    <div>
      <h1>Upload Images and Arrange on A4 Canvas</h1>
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} />

      <div>
        <canvas
          ref={canvasRef}
          width={A4_IMAGE_WIDTH}
          height={A4_IMAGE_HEIGHT}
          style={{ border: '1px solid black', marginTop: '20px', width: '595px', height: '842px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handlePrevPage} disabled={pageIndex === 0}>
          Previous Page
        </button>
        <button onClick={handleNextPage} disabled={(pageIndex + 1) * MAX_IMAGES_PER_PAGE >= images.length}>
          Next Page
        </button>
      </div>

      <button onClick={generatePDF} style={{ marginTop: '20px' }}>
        Generate PDF
      </button>
    </div>
  );
};

export default A4ImagePrinter;