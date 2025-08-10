import React, { useState, useEffect } from "react";
import getCookie from "../utils/getCookie";
import Captcha from "../components/captcha.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function PostForm({ onMessage }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    homepage_url: "",
    text_html: "",
    captcha_0: "", // captcha key
    captcha_1: "", // user input
  });

  const [captchaUrl, setCaptchaUrl] = useState("");

  // Load captcha from the server
  const loadCaptcha = async () => {
    try {
      const res = await fetch(`${API_URL}/api/captcha/`);
      const data = await res.json();
      setFormData((fd) => ({ ...fd, captcha_0: data.captcha_key }));
      setCaptchaUrl(data.captcha_image_url);
    } catch {
      onMessage("Error loading captcha");
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onMessage("");

    try {
      const res = await fetch(`${API_URL}/api/posts/create/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
         },
        body: JSON.stringify(formData),
        credentials: "include",  
      });

      const data = await res.json();

      if (res.ok) {
        onMessage("Post created successfully!");
        setFormData({
          username: "",
          email: "",
          homepage_url: "",
          text_html: "",
          captcha_0: "",
          captcha_1: "",
        });
        loadCaptcha(); // refresh captcha after successful submit
      } else {
        onMessage("Error: " + (Array.isArray(data.error) ? data.error.join(", ") : data.error));
        loadCaptcha(); // refresh captcha after error
      }
    } catch {
      onMessage("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>User Name:</label><br />
        <input name="username" value={formData.username} onChange={handleChange} required />
      </div>

      <div>
        <label>Email:</label><br />
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>

      <div>
        <label>Home page (optional):</label><br />
        <input type="url" name="homepage_url" value={formData.homepage_url} onChange={handleChange} />
      </div>

      <div>
        <label>Text:</label><br />
        <textarea name="text_html" value={formData.text_html} onChange={handleChange} rows={5} required />
      </div>

      <Captcha
        captchaUrl={captchaUrl}
        onRefresh={loadCaptcha}
        captchaValue={formData.captcha_1}
        onChange={handleChange}
      />

      <button type="submit">Submit</button>
    </form>
  );
}

export default PostForm;
