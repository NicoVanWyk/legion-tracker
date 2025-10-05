// src/components/layout/LoadingSpinner.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="text-center my-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-2">{text}</p>
    </div>
  );
};

export default LoadingSpinner;