"use client";

interface ImageItem {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  date: Date;
}

interface ImageGridProps {
  images: ImageItem[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onPreview: (image: ImageItem) => void;
}

export default function ImageGrid({
  images,
  selectedIds,
  onToggleSelect,
  onPreview,
}: ImageGridProps) {
  // Group images by date
  const groupedImages = images.reduce(
    (acc, image) => {
      const dateKey = new Date(image.date).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(image);
      return acc;
    },
    {} as Record<string, ImageItem[]>,
  );

  if (images.length === 0) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        No images found matching your filters.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {Object.entries(groupedImages).map(([date, groupImages]) => (
        <div key={date}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "var(--text-secondary)",
              marginBottom: "1rem",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "0.5rem",
            }}
          >
            {date}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {groupImages.map((img) => {
              const isSelected = selectedIds.includes(img.id);
              return (
                <div
                  key={img.id}
                  style={{
                    position: "relative",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: isSelected
                      ? "3px solid var(--primary-color)"
                      : "1px solid var(--border-color)",
                    backgroundColor: "var(--background-color)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(0,0,0,0.1)"
                      : "none",
                  }}
                  className="gallery-item"
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      left: "0.5rem",
                      zIndex: 10,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect(img.id);
                      }}
                      style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  <div
                    onClick={() => onPreview(img)}
                    style={{
                      cursor: "pointer",
                      aspectRatio: "1/1",
                      backgroundColor: "#f5f5f5",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>

                  <div style={{ padding: "0.75rem" }}>
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={img.title}
                    >
                      {img.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={img.subtitle}
                    >
                      {img.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
