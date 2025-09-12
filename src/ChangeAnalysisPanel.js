import React, { useState } from 'react';
import axios from 'axios';
import './ChangeAnalysisPanel.css';

function ChangeAnalysisPanel({ onAnalysisStart, onAnalysisComplete, onError }) {
  const [imageUrlPre, setImageUrlPre] = useState('');
  const [imageUrlPost, setImageUrlPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!imageUrlPre || !imageUrlPost) {
      alert('Please provide URLs for both "before" and "after" images.');
      return;
    }

    setIsLoading(true);
    onAnalysisStart(); // Notify parent component that analysis is starting

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/v1/change_analysis`;
      const response = await axios.post(apiUrl, {
        image_url_pre: imageUrlPre,
        image_url_post: imageUrlPost,
        instruction: 'Describe the changes between the two images.',
      });
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error("Change analysis failed:", error);
      onError("Failed to analyze changes. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-analysis-panel">
      <h3>Remote Sensing Change Analysis</h3>
      <div className="input-group">
        <label htmlFor="image-pre">Before Image URL:</label>
        <input id="image-pre" type="text" value={imageUrlPre} onChange={(e) => setImageUrlPre(e.target.value)} placeholder="e.g., /before.png" />
      </div>
      <div className="input-group">
        <label htmlFor="image-post">After Image URL:</label>
        <input id="image-post" type="text" value={imageUrlPost} onChange={(e) => setImageUrlPost(e.target.value)} placeholder="e.g., /after.png" />
      </div>
      <button onClick={handleAnalyze} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze Changes'}
      </button>
    </div>
  );
}

export default ChangeAnalysisPanel;