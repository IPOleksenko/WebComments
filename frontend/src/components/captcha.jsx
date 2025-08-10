function Captcha({ captchaUrl, onRefresh, captchaValue, onChange }) {
  return (
    <div>
      <label>Captcha:</label><br />
      {captchaUrl && (
        <img
          src={captchaUrl}
          alt="captcha"
          onClick={onRefresh}
          style={{ cursor: "pointer" }}
          title="Click to refresh captcha"
        />
      )}
      <input
        name="captcha_1"
        value={captchaValue}
        onChange={onChange}
        required
        placeholder="Enter captcha text"
      />
    </div>
  );
}

export default Captcha;
