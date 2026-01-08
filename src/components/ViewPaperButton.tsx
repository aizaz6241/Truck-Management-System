"use client";

import { useState } from "react";

export default function ViewPaperButton({ imageUrl }: { imageUrl: string }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!imageUrl) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-link"
                style={{
                    color: "var(--primary-color)",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "inherit"
                }}
            >
                View Paper
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
                        zIndex: 99999
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "8px",
                            maxWidth: "90%",
                            maxHeight: "90%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 style={{ margin: 0 }}>Trip Paper</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    cursor: "pointer",
                                    lineHeight: 1
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ overflow: "auto", display: "flex", justifyContent: "center" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt="Trip Paper"
                                style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="btn"
                                style={{ backgroundColor: "#ccc" }}
                            >
                                Close
                            </button>
                            <a
                                href={imageUrl}
                                download
                                className="btn btn-primary"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
