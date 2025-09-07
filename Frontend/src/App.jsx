import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customText, setCustomText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');

    try {
      const response = await axios.post('https://lnkr.onrender.com/create', {
        originalUrl,
        customText
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      setResult(response.data.shortUrl);
    } catch (err) {
      console.error('Error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        'Unknown error occurred'
      );
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="header">
          <h1 className="main-title">Custom Link Shortener</h1>
          <p className="subtitle">Transform your long URLs into memorable short links</p>
        </div>

        <div className="main-card">
          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label htmlFor="originalUrl" className="input-label">Original URL</label>
              <input
                id="originalUrl"
                type="url"
                className="input"
                placeholder="https://example.com/very-long-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="customText" className="input-label">Custom Text</label>
              <input
                id="customText"
                type="text"
                className="input"
                placeholder="my-custom-link"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Create Short URL
            </button>
          </form>

          {error && (
            <div className="message error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="message result-message">
              <p className="result-text">Your short URL is ready:</p>
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="result-link"
              >
                {result}
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-text">
          <span>Made with</span>
          <span className="heart">❤️</span>
          <span>by Bipul Mohapatra</span>
        </div>
      </footer>
    </>
  );
}

export default App;