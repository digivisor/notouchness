'use client';

import { useState, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCrop, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [zoom, setZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [positionStart, setPositionStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setPositionStart({ x: position.x, y: position.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    let newX = positionStart.x + deltaX;
    let newY = positionStart.y + deltaY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    let imgDisplayWidth: number;
    let imgDisplayHeight: number;
    
    if (imgAspectRatio > containerAspectRatio) {
      imgDisplayHeight = containerRect.height;
      imgDisplayWidth = imgDisplayHeight * imgAspectRatio;
    } else {
      imgDisplayWidth = containerRect.width;
      imgDisplayHeight = imgDisplayWidth / imgAspectRatio;
    }

    const scaledWidth = imgDisplayWidth * zoom;
    const scaledHeight = imgDisplayHeight * zoom;

    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0));
  };

  const handleCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    const cropSize = Math.min(containerRect.width, containerRect.height) * 0.8;
    const maxCropSize = 450;
    const finalCropSize = Math.min(cropSize, maxCropSize);
    
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    const imgAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;
    
    let imgDisplayWidth: number;
    let imgDisplayHeight: number;
    
    if (imgAspectRatio > containerAspectRatio) {
      imgDisplayHeight = containerRect.height;
      imgDisplayWidth = imgDisplayHeight * imgAspectRatio;
    } else {
      imgDisplayWidth = containerRect.width;
      imgDisplayHeight = imgDisplayWidth / imgAspectRatio;
    }

    const scaleX = naturalWidth / imgDisplayWidth;
    const scaleY = naturalHeight / imgDisplayHeight;
    
    const cropCenterX = containerRect.width / 2;
    const cropCenterY = containerRect.height / 2;
    
    const imageCenterX = containerRect.width / 2 + position.x;
    const imageCenterY = containerRect.height / 2 + position.y;
    
    const offsetX = imageCenterX - cropCenterX;
    const offsetY = imageCenterY - cropCenterY;
    
    const naturalOffsetX = (offsetX / zoom) * scaleX;
    const naturalOffsetY = (offsetY / zoom) * scaleY;
    
    const naturalCropSize = (finalCropSize / zoom) * Math.min(scaleX, scaleY);
    
    const sourceX = (naturalWidth / 2) - (naturalCropSize / 2) + naturalOffsetX;
    const sourceY = (naturalHeight / 2) - (naturalCropSize / 2) + naturalOffsetY;

    const clampedSourceX = Math.max(0, Math.min(naturalWidth - naturalCropSize, sourceX));
    const clampedSourceY = Math.max(0, Math.min(naturalHeight - naturalCropSize, sourceY));
    const clampedCropSize = Math.min(
      naturalCropSize,
      naturalWidth - clampedSourceX,
      naturalHeight - clampedSourceY
    );

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.drawImage(
      img,
      clampedSourceX,
      clampedSourceY,
      clampedCropSize,
      clampedCropSize,
      0,
      0,
      outputSize,
      outputSize
    );

    const croppedImage = canvas.toDataURL('image/png');
    onCrop(croppedImage);
  }, [position, zoom, onCrop]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Profil Fotoğrafını Düzenle</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
          {/* Left Side - Image Crop Area */}
          <div className="flex-1 p-6 min-h-0 flex items-center justify-center bg-gray-50 overflow-hidden">
            <div
              ref={containerRef}
              className="relative w-full h-full max-w-[600px] bg-gray-900 rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
            >
              {/* Dark Overlay - 4 sides */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <div className="absolute top-0 left-0 right-0 bg-black/70" style={{ height: 'calc((100% - min(80%, 450px)) / 2)' }} />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70" style={{ height: 'calc((100% - min(80%, 450px)) / 2)' }} />
                <div className="absolute left-0 bg-black/70" style={{ 
                  top: 'calc((100% - min(80%, 450px)) / 2)', 
                  bottom: 'calc((100% - min(80%, 450px)) / 2)', 
                  width: 'calc((100% - min(80%, 450px)) / 2)' 
                }} />
                <div className="absolute right-0 bg-black/70" style={{ 
                  top: 'calc((100% - min(80%, 450px)) / 2)', 
                  bottom: 'calc((100% - min(80%, 450px)) / 2)', 
                  width: 'calc((100% - min(80%, 450px)) / 2)' 
                }} />
              </div>
              
              {/* Crop Circle Border */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div
                  className="border-2 border-white"
                  style={{
                    width: 'min(80%, 450px)',
                    height: 'min(80%, 450px)',
                    borderRadius: '50%',
                  }}
                />
              </div>

              {/* Image */}
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                  draggable={false}
                  onLoad={() => {
                    setPosition({ x: 0, y: 0 });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-gray-200 p-6 flex flex-col justify-between bg-white">
            {/* Zoom Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Yakınlaştırma
                </label>
                <div className="space-y-4">
                  {/* Zoom Slider */}
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="5"
                      value={zoom * 100}
                      onChange={(e) => setZoom(parseFloat(e.target.value) / 100)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>300%</span>
                    </div>
                  </div>
                  
                  {/* Zoom Buttons */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleZoomOut}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoom <= 0}
                    >
                      <ZoomOut size={24} />
                    </button>
                    <div className="flex items-center gap-2 min-w-[80px] justify-center">
                      <span className="text-lg font-semibold text-gray-900">{Math.round(zoom * 100)}%</span>
                    </div>
                    <button
                      onClick={handleZoomIn}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoom >= 3}
                    >
                      <ZoomIn size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCrop}
                className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Kaydet
              </button>
              <button
                onClick={onCancel}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
