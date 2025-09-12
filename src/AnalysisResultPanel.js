import React from 'react';
import './AnalysisResultPanel.css';

function AnalysisResultPanel({ caption, onClear }) {
  if (!caption) {
    return null;
  }

  return (
    <div className="analysis-result-panel">
      <h4>Analysis Result</h4>
      <p>"{caption}"</p>
      <button onClick={onClear}>Clear Result</button>
    </div>
  );
}

export default AnalysisResultPanel;