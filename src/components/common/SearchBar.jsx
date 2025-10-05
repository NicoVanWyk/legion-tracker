// src/components/common/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const SearchBar = ({ placeholder, onSearch, value = '', debounceTime = 300 }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  
  // Update internal state when external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);
  
  // Debounce search to avoid too many updates
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only trigger search if the terms differ
      if (searchTerm !== value) {
        onSearch(searchTerm);
      }
    }, debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch, debounceTime, value]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder || "Search..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search"
        />
        {searchTerm && (
          <Button 
            variant="outline-secondary" 
            onClick={handleClear}
            title="Clear search"
          >
            &times;
          </Button>
        )}
        <Button type="submit" variant="outline-primary">
          <i className="bi bi-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;