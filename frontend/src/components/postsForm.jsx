import { useState, useEffect } from "react";
import getCookie from "../utils/getCookie";
import Captcha from "./Captcha";
import FileUpload from "./FileUpload";
import "../style/components/postsForm.css";

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
  const [previewText, setPreviewText] = useState("");

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

    setPreviewText(formatPreview(value));
  };

const formatPreview = (text) => {
  // Replace all \n with <br>
  let formattedText = text.replace(/\n/g, '<br>');

  // Remove all tags except <a>, <i>, <strong>, <code>, <br>
  formattedText = formattedText.replace(/<(?!\/?(a|code|i|strong|br)(\s[^>]*|)\/?>)[^>]+>/g, '');

  // Only keep href and title attributes for the <a> tag
  formattedText = formattedText.replace(/<a([^>]*?)\s+(?!href|title)[^>]+>/g, '<a$1>');

  return formattedText;
};

  const handleFileChange = (newFiles, errors) => {
    if (errors.length > 0) {
      onMessage("Error: " + errors.join(" "));
    } else {
      setFiles(newFiles);
    }
  };

  const handleOpenCaptcha = (e) => {
    e.preventDefault();
    setShowCaptcha(true);
  };

  const handleCaptchaSubmit = async (captchaData) => {
    const dataToSend = { ...formData, ...captchaData };
    const form = new FormData();

    Object.keys(dataToSend).forEach((key) => form.append(key, dataToSend[key]));
    Array.from(files).forEach((file) => form.append("files", file));

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
        setFiles([]);
        setPreviewText('');
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

  // Formatting button handlers
  const formatText = (formatType) => {
    const textarea = document.getElementById("text_html");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.slice(start, end);
    let formattedText;

    switch (formatType) {
      case 'italic':
        formattedText = `<i>${selectedText}</i>`;
        break;
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'code':
        formattedText = `<code>${selectedText}</code>`;
        break;
      case 'link':
        let url = selectedText.trim();
        
        if (url && !/^https?:\/\//i.test(url)) {
          url = "http://" + url;
        }
        
        formattedText = `<a href="${url}" target="_blank" title="${url}">${selectedText}</a>`;
        break;

      case 'br':
        formattedText = `<br>`;
        break;
      default:
        return;
    }

    setFormData((prev) => ({
      ...prev,
      text_html: prev.text_html.slice(0, start) + formattedText + prev.text_html.slice(end),
    }));
    setPreviewText(formatPreview(formData.text_html.slice(0, start) + formattedText + formData.text_html.slice(end)));
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
          <div className="toolbar">
            <button type="button" onClick={() => formatText('italic')}>[i]</button>
            <button type="button" onClick={() => formatText('bold')}>[strong]</button>
            <button type="button" onClick={() => formatText('code')}>[code]</button>
            <button type="button" onClick={() => formatText('link')}>[a]</button>
            <button type="button" onClick={() => formatText('br')}>[br]</button>
          </div>
          <textarea
            id="text_html"
            name="text_html"
            value={formData.text_html}
            onChange={handleChange}
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <h4>Preview:</h4>
          <div
            id="preview"
            className="preview-container"
            dangerouslySetInnerHTML={{ __html: previewText }}
          />
        </div>

        <FileUpload 
          formId={formId}
          files={files} 
          onFileChange={handleFileChange} 
          onMessage={onMessage}
        />

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
