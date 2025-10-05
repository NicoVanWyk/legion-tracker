// src/components/reference/ReferenceForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReferenceCategories from '../../enums/ReferenceCategories';

const ReferenceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    term: '',
    category: ReferenceCategories.CUSTOM,
    description: '',
    examples: [''],
    relatedTerms: []
  });
  
  // Load reference data if editing
  useEffect(() => {
    const fetchReference = async () => {
      try {
        if (!id || !currentUser) return;
        
        const refRef = doc(db, 'users', currentUser.uid, 'references', id);
        const refDoc = await getDoc(refRef);
        
        if (refDoc.exists()) {
          const refData = refDoc.data();
          setFormData({
            ...refData,
            // Ensure we have the required fields even if they're missing in the data
            examples: refData.examples || [''],
            relatedTerms: refData.relatedTerms || []
          });
        } else {
          setError('Reference not found or you do not have permission to edit it');
        }
      } catch (err) {
        console.error('Error fetching reference:', err);
        setError('Failed to load reference. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReference();
  }, [id, currentUser]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle example changes
  const handleExampleChange = (index, value) => {
    const updatedExamples = [...formData.examples];
    updatedExamples[index] = value;
    setFormData({ ...formData, examples: updatedExamples });
  };
  
  // Add a new example field
  const addExample = () => {
    setFormData({ ...formData, examples: [...formData.examples, ''] });
  };
  
  // Remove an example
  const removeExample = (index) => {
    const updatedExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      examples: updatedExamples.length ? updatedExamples : [''] 
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      // Validate required fields
      if (!formData.term.trim()) {
        throw new Error('Term is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      // Filter out empty examples
      const filteredExamples = formData.examples.filter(ex => ex.trim() !== '');
      
      // Prepare reference data
      const referenceData = {
        ...formData,
        examples: filteredExamples,
        lastUpdated: serverTimestamp()
      };
      
      if (id) {
        // Update existing reference
        await updateDoc(
          doc(db, 'users', currentUser.uid, 'references', id), 
          referenceData
        );
        setSuccess('Reference updated successfully!');
      } else {
        // Create new reference
        referenceData.createdAt = serverTimestamp();
        referenceData.createdBy = currentUser.uid;
        
        const docRef = await addDoc(
          collection(db, 'users', currentUser.uid, 'references'), 
          referenceData
        );
        
        setSuccess('Reference created successfully!');
        
        // Navigate to reference details after a short delay
        setTimeout(() => {
          navigate(`/references/${docRef.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving reference:', err);
      setError(err.message || 'Failed to save reference. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading reference data...</p>
      </div>
    );
  }
  
  return (
    <div className="reference-form">
      <Card>
        <Card.Header>
          <h3 className="mb-0">{id ? 'Edit Reference' : 'Create New Reference'}</h3>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={8}>
                <Form.Group controlId="term">
                  <Form.Label>Term*</Form.Label>
                  <Form.Control
                    type="text"
                    name="term"
                    value={formData.term}
                    onChange={handleChange}
                    placeholder="Enter term or keyword"
                    required
                  />
                  <Form.Text className="text-muted">
                    The name of the rule, keyword, or concept
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group controlId="category">
                  <Form.Label>Category*</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {ReferenceCategories.getAllCategories().map(category => (
                      <option key={category} value={category}>
                        {ReferenceCategories.getDisplayName(category)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4" controlId="description">
              <Form.Label>Description*</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a detailed description"
                rows={4}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Examples</Form.Label>
              <div className="examples-container">
                {formData.examples.map((example, index) => (
                  <InputGroup key={index} className="mb-2">
                    <Form.Control
                      type="text"
                      value={example}
                      onChange={(e) => handleExampleChange(index, e.target.value)}
                      placeholder={`Example ${index + 1}`}
                    />
                    <Button
                      variant="outline-danger"
                      onClick={() => removeExample(index)}
                    >
                      Remove
                    </Button>
                  </InputGroup>
                ))}
                <Button
                  variant="outline-secondary"
                  onClick={addExample}
                  className="mt-2"
                >
                  Add Example
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Card.Body>
        
        <Card.Footer className="d-flex justify-content-between">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/references')}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {id ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              id ? 'Update Reference' : 'Create Reference'
            )}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ReferenceForm;