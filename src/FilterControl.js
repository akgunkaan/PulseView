import React from 'react';
import './FilterControl.css';

function FilterControl({ categories, selectedCategories, onCategoryChange }) {
  return (
    <div className="filter-control">
      <h4>Filter by Category</h4>
      {categories.map(category => (
        <div key={category}>
          <input
            type="checkbox"
            id={category}
            name={category}
            value={category}
            checked={selectedCategories.includes(category)}
            onChange={() => onCategoryChange(category)}
          />
          <label htmlFor={category}>{category}</label>
        </div>
      ))}
    </div>
  );
}

export default FilterControl;