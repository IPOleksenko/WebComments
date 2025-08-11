import { useState, useEffect } from "react";
import getCookie from "../utils/getCookie.jsx";
import Captcha from "./captcha.jsx";
import "../style/components/postsForm.css"

const API_URL = import.meta.env.VITE_API_URL;

function PostsForm({ onMessage, onPostCreated, parentId = null }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    homepage_url: "",
    text_html: "",
    captcha_0: "",
    captcha_1: "",
    parent_id: parentId,
  });

  const [files, setFiles] = useState([]);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);
  const formId = parentId ? `reply-form-${parentId}` : 'main-post-form';

  useEffect(() => {
    const savedUsername = localStorage.getItem("username") || "";
    const savedEmail = localStorage.getItem("email") || "";
    const savedHomepage = localStorage.getItem("homepage_url") || "";

    setFormData((prev) => ({
      ...prev,
      username: savedUsername,
      email: savedEmail,
      homepage_url: savedHomepage,
      parent_id: parentId,
    }));
  }, [parentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (["username", "email", "homepage_url"].includes(name)) {
      localStorage.setItem(name, value);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Client-side file validation for file input
      const errors = [];
      const validFiles = [];
      
      Array.from(e.target.files).forEach((file) => {
        // Check file size (assuming max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`File ${file.name} is too large. Maximum size is 5MB.`);
        }
        
        // Check file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          errors.push(`File ${file.name} has an invalid format. Only JPG, GIF, PNG, and txt files are allowed.`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (errors.length > 0) {
        onMessage("Error: " + errors.join(" "));
        setFileErrors(errors);
      } else {
        setFileErrors([]);
      }
      
      if (validFiles.length > 0) {
        // Create a new FileList object with valid files
        const dataTransfer = new DataTransfer();
        validFiles.forEach(f => dataTransfer.items.add(f));
        e.target.files = dataTransfer.files;
        setFiles(dataTransfer.files);
      } else {
        // Clear files if all are invalid
        e.target.value = "";
        setFiles([]);
      }
    } else {
      setFiles(e.target.files); // Update the list of files
      setFileErrors([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Client-side file validation for drag and drop
      const errors = [];
      const validFiles = [];
      
      Array.from(e.dataTransfer.files).forEach((file) => {
        // Check file size (assuming max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`File ${file.name} is too large. Maximum size is 5MB.`);
        }

        // Check file type
        const allowedTypes = [
          'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
          'text/plain'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          errors.push(`File ${file.name} has an invalid format. Only JPG, GIF, PNG, and txt files are allowed.`);
        } else {
          validFiles.push(file);
        }
      });
      
      if (errors.length > 0) {
        onMessage("Error: " + errors.join(" "));
        setFileErrors(errors);
      } else {
        setFileErrors([]);
      }
      
      if (validFiles.length > 0) {
        // Create a new FileList object with valid files
        const dataTransfer = new DataTransfer();
        validFiles.forEach(f => dataTransfer.items.add(f));
        document.getElementById(`files-${formId}`).files = dataTransfer.files;
        setFiles(dataTransfer.files);
      }
    }
  };

  const handleOpenCaptcha = (e) => {
    e.preventDefault();
    
    // Client-side file validation
    const errors = [];
    
    // Check file types and sizes
    Array.from(files).forEach((file) => {
      // Check file size (assuming max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File ${file.name} is too large. Maximum size is 5MB.`);
      }
      
      // Check file type (allow only JPG, GIF, PNG, and txt files)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${file.name} has an invalid format. Only JPG, GIF, PNG, and txt files are allowed.`);
      }
    });
    
    setFileErrors(errors);
    
    if (errors.length > 0) {
      onMessage("Error: " + errors.join(" "));
      return;
    } else {
      setFileErrors([]);
    }
    
    setShowCaptcha(true);
  };

  const handleCaptchaSubmit = async (captchaData) => {
    const dataToSend = { ...formData, ...captchaData };

    const form = new FormData(); // Use FormData to send files

    // Add all data to FormData
    Object.keys(dataToSend).forEach((key) => {
      form.append(key, dataToSend[key]);
    });

    // Add files to FormData
    Array.from(files).forEach((file) => {
      form.append("files", file);
    });

    try {
      const res = await fetch(`${API_URL}/api/posts/create/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: form,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        onMessage("Post created successfully!");
        onPostCreated?.();
        setFormData((prev) => ({
          ...prev,
          text_html: "",
          captcha_0: "",
          captcha_1: "",
        }));
        setFiles([]); // Clear files after successful submission
      } else {
        onMessage(
          "Error: " +
            (Array.isArray(data.error) ? data.error.join(", ") : data.error)
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      onMessage("Network error: " + error.message);
    }
  };

  return (
    <div className="posts-form-container">
      <form className="posts-form" onSubmit={handleOpenCaptcha}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">User Name:</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="homepage_url">Home page (optional):</label>
          <input
            id="homepage_url"
            type="url"
            name="homepage_url"
            value={formData.homepage_url}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="text_html">Text:</label>
          <textarea
            id="text_html"
            name="text_html"
            value={formData.text_html}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        {/* File upload field */}
        <div className="form-group">
          <label htmlFor="files">Attach files:</label>
          <div
            className={`file-upload ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id={`files-${formId}`}
              type="file"
              name="files"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor={`files-${formId}`} className="file-upload-label">
              {dragOver ? 'Drop files here' : 'Choose Files or Drag & Drop'}
            </label>
            {files.length > 0 && (
              <div className="file-list">
                <h4>Selected Files:</h4>
                <ul>
                  {Array.from(files).map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      {file.name}
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => {
                          const newFiles = Array.from(files).filter((_, i) => i !== index);
                          // Create a new FileList object
                          const dataTransfer = new DataTransfer();
                          newFiles.forEach(f => dataTransfer.items.add(f));
                          document.getElementById(`files-${formId}`).files = dataTransfer.files;
                          setFiles(dataTransfer.files);
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {fileErrors.length > 0 && (
              <div className="file-errors">
                <button
                  className="close-errors-btn"
                  onClick={() => setFileErrors([])}
                >
                  ×
                </button>
                <ul>
                  {fileErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          {parentId ? "Reply" : "Submit"}
        </button>
      </form>

      {showCaptcha && (
        <Captcha
          onClose={() => setShowCaptcha(false)}
          onSubmit={handleCaptchaSubmit}
          onMessage={onMessage}
        />
      )}
    </div>
  );
}

export default PostsForm;
