import { useState, useEffect } from "react";
import "../style/components/captcha.css";

const API_URL = import.meta.env.VITE_API_URL;

function Captcha({ onClose, onSubmit, onMessage }) {
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const loadCaptcha = async () => {
    try {
      const res = await fetch(`${API_URL}/api/captcha/`);
      const data = await res.json();
      setCaptchaKey(data.captcha_key);
      setCaptchaUrl(data.captcha_image_url);
      setCaptchaInput("");
    } catch {
      onMessage?.("Error loading captcha");
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = () => {
    onSubmit({ captcha_0: captchaKey, captcha_1: captchaInput });
    onClose();
  };

  return (
    <div className="captcha-overlay">
      <div className="captcha-modal">
        <h2>Enter Captcha</h2>
        {captchaUrl && (
          <img
            src={captchaUrl}
            alt="captcha"
            onClick={loadCaptcha}
            className="captcha-image"
          />
        )}
        <input
          type="text"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
          placeholder="Enter captcha text"
          required
        />
        <div className="captcha-buttons">
          <button onClick={handleSubmit}>OK</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Captcha;
