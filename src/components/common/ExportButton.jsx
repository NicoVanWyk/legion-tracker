// src/components/common/ExportButton.jsx
import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import ExportUtils from '../../utils/ExportUtils';

/**
 * A reusable export button component with options for different export formats
 */
const ExportButton = ({ variant = "outline-secondary", className, onExport, exportTypes = ['text'], text = "Export" }) => {
  const handleExport = (type) => {
    if (onExport) {
      onExport(type);
    }
  };

  // If there's only one export type, render a simple button
  if (exportTypes.length === 1) {
    return (
      <Button
        variant={variant}
        className={className}
        onClick={() => handleExport(exportTypes[0])}
      >
        <i className="bi bi-download me-1"></i> {text}
      </Button>
    );
  }

  // Otherwise render a dropdown with multiple export options
  return (
    <Dropdown className={`d-inline-block ${className || ''}`}>
      <Dropdown.Toggle variant={variant} id="dropdown-export">
        <i className="bi bi-download me-1"></i> {text}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {exportTypes.includes('text') && (
          <Dropdown.Item onClick={() => handleExport('text')}>
            <i className="bi bi-file-text me-2"></i> Export as Text (.txt)
          </Dropdown.Item>
        )}
        {exportTypes.includes('json') && (
          <Dropdown.Item onClick={() => handleExport('json')}>
            <i className="bi bi-file-code me-2"></i> Export as JSON (.json)
          </Dropdown.Item>
        )}
        {exportTypes.includes('csv') && (
          <Dropdown.Item onClick={() => handleExport('csv')}>
            <i className="bi bi-file-spreadsheet me-2"></i> Export as CSV (.csv)
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ExportButton;