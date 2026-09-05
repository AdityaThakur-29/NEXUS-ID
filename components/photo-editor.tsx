"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

interface PhotoEditorProps {
  value: string;
  onChange: (url: string) => void;
}

export function PhotoEditor({ value, onChange }: PhotoEditorProps) {
  const [inputUrl, setInputUrl] = useState(value || "");
  const [activeImage, setActiveImage] = useState(value || "");
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isCropped, setIsCropped] = useState(false);
  const [cropError, setCropError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  useEffect(() => {
    if (value && value !== activeImage) {
      setActiveImage(value);
      setInputUrl(value.startsWith("data:") ? "" : value);
    }
  }, [value]);

  function handleLoadUrl() {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setActiveImage(trimmed);
    onChange(trimmed);
    resetControls();
    setIsCropped(false);
    setCropError("");
  }

  function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size should be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setActiveImage(dataUrl);
      onChange(dataUrl);
      setInputUrl("");
      resetControls();
      setIsCropped(false);
      setCropError("");
    };
    reader.readAsDataURL(file);
  }

  function resetControls() {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  }

  function handleRemove() {
    setActiveImage("");
    setInputUrl("");
    onChange("");
    resetControls();
    setIsCropped(false);
    setCropError("");
  }

  // Mouse drag handlers for direct panning in the preview circle
  function handleMouseDown(e: React.MouseEvent) {
    if (!activeImage) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.startPanX + dx);
    setPanY(dragStartRef.current.startPanY + dy);
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Canvas Crop Generator
  function applyCrop() {
    if (!activeImage) return;
    setCropError("");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 320; // High-resolution avatar size
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Circular clipping
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Center origin for transforms
        ctx.translate(size / 2, size / 2);
        ctx.translate(panX * (size / 150), panY * (size / 150));
        ctx.scale(zoom, zoom);
        ctx.rotate((rotation * Math.PI) / 180);

        // Draw image centered
        const aspect = img.width / img.height;
        let drawW = size;
        let drawH = size;
        if (aspect > 1) {
          drawW = size * aspect;
        } else {
          drawH = size / aspect;
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        const croppedData = canvas.toDataURL("image/jpeg", 0.92);
        setActiveImage(croppedData);
        onChange(croppedData);
        resetControls();
        setIsCropped(true);
      } catch {
        // Fallback for CORS restricted external images
        setCropError("External host prevented client crop (CORS). Original URL will be saved.");
        onChange(activeImage);
      }
    };
    img.onerror = () => {
      setCropError("Could not load image from provided URL.");
    };
    img.src = activeImage;
  }

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "16px",
        padding: "16px",
        display: "grid",
        gap: "14px",
      }}
    >
      {/* URL Input Bar */}
      <div style={{ display: "grid", gap: "6px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLoadUrl();
              }
            }}
            placeholder="Paste Photo URL (e.g. https://images.unsplash.com/...)"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="button primary"
            style={{ whiteSpace: "nowrap", padding: "10px 14px", fontSize: "12px" }}
            onClick={handleLoadUrl}
          >
            Load URL
          </button>
          <label
            className="button"
            style={{
              whiteSpace: "nowrap",
              padding: "10px 14px",
              fontSize: "12px",
              cursor: "pointer",
              margin: 0,
            }}
          >
            Upload File
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <small style={{ color: "var(--muted)", fontSize: "12px" }}>
          Enter any public image URL or select an image file from your device.
        </small>
      </div>

      {/* Preview & Editor Controls */}
      {activeImage && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "20px",
            alignItems: "center",
            paddingTop: "10px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Circular Crop Viewport */}
          <div style={{ display: "grid", placeItems: "center", gap: "8px" }}>
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid var(--cyan)",
                boxShadow: "0 0 16px rgba(67, 231, 255, 0.25)",
                background: "#070811",
                cursor: isDragging ? "grabbing" : "grab",
                position: "relative",
                display: "grid",
                placeItems: "center",
                userSelect: "none",
              }}
              title="Click and drag to reposition photo"
            >
              <img
                src={activeImage}
                alt="Badge Avatar Preview"
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                  pointerEvents: "none",
                }}
              />
            </div>
            <span style={{ fontSize: "11px", color: "var(--cyan)", fontFamily: "monospace" }}>
              {isCropped ? "✓ CROPPED" : "DRAG TO REPOSITION"}
            </span>
          </div>

          {/* Controls Panel */}
          <div style={{ display: "grid", gap: "10px" }}>
            {/* Zoom Controls */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>Zoom</span>
                <span style={{ color: "var(--cyan)", fontFamily: "monospace" }}>{zoom.toFixed(2)}x</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
                >
                  − Zoom Out
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="button"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                >
                  + Zoom In
                </button>
              </div>
            </div>

            {/* Position Adjust Controls */}
            <div>
              <span style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>Position (Nudge)</span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={() => setPanX((x) => x - 10)}
                  title="Move Left"
                >
                  ◀ Left
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={() => setPanX((x) => x + 10)}
                  title="Move Right"
                >
                  ▶ Right
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={() => setPanY((y) => y - 10)}
                  title="Move Up"
                >
                  ▲ Up
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={() => setPanY((y) => y + 10)}
                  title="Move Down"
                >
                  ▼ Down
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate 90°"
                >
                  ⟳ Rotate
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ padding: "5px 12px", fontSize: "11px" }}
                  onClick={resetControls}
                  title="Reset Position and Zoom"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
              <button
                type="button"
                className="button primary"
                style={{ padding: "7px 14px", fontSize: "12px" }}
                onClick={applyCrop}
                title="Crop and lock this framed avatar"
              >
                ✂ Apply Crop
              </button>
              <button
                type="button"
                className="button danger"
                style={{ padding: "7px 14px", fontSize: "12px" }}
                onClick={handleRemove}
              >
                Remove Photo
              </button>
              {cropError && (
                <span style={{ fontSize: "12px", color: "#ffb7c3" }}>
                  {cropError}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
