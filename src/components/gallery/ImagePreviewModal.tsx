"use client";

import { useEffect, useCallback } from "react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ImagePreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
    },
    [isOpen, onClose, hasNext, hasPrev, onNext, onPrev],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          gap: "1rem",
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={imageUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{
            backgroundColor: "white",
            color: "black",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            padding: "0.5rem 1rem",
          }}
        >
          Download
        </a>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "2rem",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {title && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            color: "white",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {title}
        </div>
      )}

      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          style={{
            position: "absolute",
            left: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "3rem",
            cursor: "pointer",
            width: "50px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          ‹
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          style={{
            position: "absolute",
            right: "2rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "3rem",
            cursor: "pointer",
            width: "50px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          ›
        </button>
      )}

      {/* Image */}
      <div
        style={{
          width: "90%",
          height: "85%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title || "Preview"}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
