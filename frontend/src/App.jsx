
import { useEffect, useState } from "react";
import { ImagePlus, Upload, Trash2, CheckCircle2 } from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5006";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadImages() {
    try {
      const res = await fetch(`${API}/api/images`);
      if (!res.ok) throw new Error("Could not load images");
      setImages(await res.json());
    } catch {
      setError("server is not connected please check your backend ");
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setMessage("");
    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5 MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload(e) {
    e.preventDefault();

    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API}/api/images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      setMessage("Image uploaded successfully!");
      setFile(null);
      setPreview("");
      e.target.reset?.();
      await loadImages();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, imageName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${imageName}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API}/api/images/${id}`, {
  method: "DELETE",
});

const data = await res.json();

if (!res.ok) {
  console.error("Delete failed:", data.message);
  throw new Error(data.message || "Delete failed");
}

      setImages((currentImages) =>
        currentImages.filter((image) => image._id !== id)
      );

      setMessage("Image deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete image.");
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div className="brand-icon">
            <ImagePlus size={27} />
          </div>
          <div>
            <h1>Image Studio</h1>
            <p> Upload, preview and manage your images.</p>
          </div>
        </header>

        <section className="upload-card">
          <div className="section-heading">
            <h2>Upload your image</h2>
            <span>MAX 5 MB</span>
          </div>

          <form onSubmit={handleUpload}>
            <label className="dropzone">
              {preview ? (
                <img src={preview} alt="Selected image preview" />
              ) : (
                <>
                  <div className="upload-icon">
                    <ImagePlus size={34} />
                  </div>
                  <h3>Choose an image to upload</h3>
                  <p>JPG, PNG or WEBP · Maximum 5 MB</p>
                </>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </label>

            {file && <p className="file-name">{file.name}</p>}

            {error && <p className="alert error">{error}</p>}
            {message && (
              <p className="alert success">
                <CheckCircle2 size={18} /> {message}
              </p>
            )}

            <button className="upload-button" disabled={loading || !file}>
              <Upload size={19} />
              {loading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </section>

        <section className="gallery-section">
          <div className="section-heading">
            <h2>Uploaded images</h2>
            <span>{images.length} images</span>
          </div>

          {images.length === 0 ? (
            <p className="empty">Your uploaded images will appear here.</p>
          ) : (
            <div className="gallery">
  {images.map((image, index) => (
    <article
      className="image-card"
      key={image._id}
      style={{ animationDelay: `${Math.min(index * 0.08, 0.5)}s` }}
    >
      <img
        src={`${API}${image.imageUrl}`}
        alt={image.originalName}
        loading="lazy"
        className="gallery-image"
        onError={(e) => {
          console.error("Image URL failed:", e.currentTarget.src);
        }}
      />

      <div className="image-info">
        <p title={image.originalName}>{image.originalName}</p>

        <span>
          {new Date(image.createdAt).toLocaleDateString()}
        </span>

        <button
          type="button"
          className="delete-button"
          onClick={() => handleDelete(image._id, image.originalName)}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </article>
  ))}
</div>
          )}
        </section>
      </div>
    </main>
  );
}
