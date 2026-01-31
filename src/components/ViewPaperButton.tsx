"use client";

import { useState } from "react";

export default function ViewPaperButton({
  imageUrl,
  images = [],
  className,
  buttonText,
  style,
}: {
  imageUrl: string;
  images?: string[];
  className?: string; // Optional custom class
  buttonText?: string; // Optional custom text
  style?: React.CSSProperties; // Optional inline style
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Combine legacy single URL with new images array if needed, or just use images if present
  // If `images` is passed, use it. If not, fallback to [imageUrl].
  // Also ensure we don't duplicate if imageUrl is already in images (though typical usage might be either/or or mixed).
  // Safest: Use images if available and non-empty, otherwise [imageUrl].
  // If `imageUrl` is also in `images`, we dedupe? Or just assume `images` contains all.
  // Based on my edit in page.tsx: `imageUrl={trip.paperImage || trip.images[0]?.url || ""} images={trip.images.map(i => i.url)}`
  // So `images` will be the source of truth if populated.
  const displayImages = images.length > 0 ? images : [imageUrl];
  const currentImage = displayImages[selectedIndex];

  // If no images at all, return null
  if (!imageUrl && images.length === 0) return null;

  return (
    <>
      <button
        onClick={() => {
          setSelectedIndex(0);
          setIsOpen(true);
        }}
        className={className || "btn-link"}
        style={
          style ||
          (className
            ? {}
            : {
                color: "var(--primary-color)",
                textDecoration: "underline",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: "inherit",
              })
        }
      >
        {buttonText ||
          `View Paper${images.length > 1 ? `s (${images.length})` : ""}`}
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "8px",
              maxHeight: "90%",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "90%" /* Responsive width with margin */,
              maxWidth: "600px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Trip Paper
                {displayImages.length > 1
                  ? ` (${selectedIndex + 1}/${displayImages.length})`
                  : ""}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                minHeight: "300px", // Ensure space
              }}
            >
              {/* Main Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage}
                alt={`Trip Paper ${selectedIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Thumbnails if multiple */}
            {displayImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                  justifyContent: "center",
                }}
              >
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      width: "60px",
                      height: "60px",
                      border:
                        selectedIndex === idx
                          ? "2px solid var(--primary-color)"
                          : "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="btn"
                style={{ backgroundColor: "#ccc" }}
              >
                Close
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(currentImage);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `trip-paper-${selectedIndex + 1}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (err) {
                    console.error("Download failed", err);
                    window.open(currentImage, "_blank");
                  }
                }}
                className="btn btn-primary"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
