import { useState } from "react";

function FileUpload({ formId, files, onFileChange, onMessage }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileErrors, setFileErrors] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const errors = [];
      const validFiles = [];
      Array.from(e.target.files).forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`File ${file.name} is too large. Maximum size is 5MB.`);
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'text/plain'];
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
        onFileChange(validFiles, errors);
      }
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
    const droppedFiles = e.dataTransfer.files;
    handleFileChange({ target: { files: droppedFiles } });
  };

  return (
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
                      const dataTransfer = new DataTransfer();
                      newFiles.forEach(f => dataTransfer.items.add(f));
                      document.getElementById(`files-${formId}`).files = dataTransfer.files;
                      onFileChange(newFiles, []);
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
  );
}

export default FileUpload;
