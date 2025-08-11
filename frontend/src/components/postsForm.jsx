import { useState, useEffect } from "react";
import getCookie from "../utils/getCookie.jsx";
import Captcha from "./captcha.jsx";

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
    setFiles(e.target.files); // Update the list of files
  };

  const handleOpenCaptcha = (e) => {
    e.preventDefault();
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
    } catch {
      onMessage("Network error");
    }
  };

  return (
    <>
      <form onSubmit={handleOpenCaptcha}>
        <div>
          <label>User Name:</label><br />
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email:</label><br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Home page (optional):</label><br />
          <input
            type="url"
            name="homepage_url"
            value={formData.homepage_url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Text:</label><br />
          <textarea
            name="text_html"
            value={formData.text_html}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        {/* File upload field */}
        <div>
          <label>Attach files:</label><br />
          <input
            type="file"
            name="files"
            multiple
            onChange={handleFileChange}
          />
        </div>

        <button type="submit">
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
    </>
  );
}

export default PostsForm;
