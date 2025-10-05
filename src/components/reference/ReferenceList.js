// src/components/reference/ReferenceList.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import ReferenceCategories from '../../enums/ReferenceCategories';
import SearchBar from '../common/SearchBar';

const ReferenceList = () => {
  const [references, setReferences] = useState([]);
  const [filteredRefs, setFilteredRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        
        // Base reference collection query - includes system references
        let refsQuery = query(
          collection(db, 'references'), 
          orderBy('term', 'asc')
        );
        
        // Execute the query
        const querySnapshot = await getDocs(refsQuery);
        
        // Map through the documents
        const refsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If user is authenticated, also get their custom references
        if (currentUser) {
          const userRefsQuery = query(
            collection(db, 'users', currentUser.uid, 'references'),
            orderBy('term', 'asc')
          );
          
          const userQuerySnapshot = await getDocs(userRefsQuery);
          
          // Add user custom references to the list
          userQuerySnapshot.docs.forEach(doc => {
            refsData.push({
              id: doc.id,
              ...doc.data(),
              isCustom: true // Flag to identify custom references
            });
          });
          
          // Sort all references by term
          refsData.sort((a, b) => a.term.localeCompare(b.term));
        }
        
        setReferences(refsData);
        setFilteredRefs(refsData);
        setError('');
      } catch (err) {
        console.error('Error fetching references:', err);
        setError('Failed to fetch references. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReferences();
  }, [currentUser]);

  useEffect(() => {
    // Filter references based on category and search term
    let result = references;
    
    if (activeCategory !== 'all') {
      result = result.filter(ref => ref.category === activeCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ref => 
        ref.term.toLowerCase().includes(term) || 
        ref.description?.toLowerCase().includes(term)
      );
    }
    
    setFilteredRefs(result);
  }, [activeCategory, searchTerm, references]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
  };

  // Format references into a grid of cards
  const renderReferenceGrid = () => {
    return (
      <Row className="reference-grid">
        {filteredRefs.map(ref => (
          <Col key={ref.id} md={6} lg={4} className="mb-4">
            <Card className="h-100 reference-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{ref.term}</h5>
                <Badge 
                  bg={ReferenceCategories.getBadgeColor(ref.category)} 
                  className="ms-2"
                >
                  {ReferenceCategories.getDisplayName(ref.category)}
                </Badge>
              </Card.Header>
              <Card.Body>
                <p className="reference-description">
                  {ref.description?.length > 150
                    ? `${ref.description.substring(0, 150)}...`
                    : ref.description}
                </p>
                {ref.examples && ref.examples.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">Examples: {ref.examples.length}</small>
                  </div>
                )}
                <div className="reference-footer d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {ref.isCustom ? 'Custom Reference' : 'System Reference'}
                  </small>
                  <Button 
                    as={Link} 
                    to={`/references/${ref.id}`} 
                    variant="primary" 
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="reference-list">
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6} className="mb-3 mb-md-0">
              <SearchBar 
                placeholder="Search references..." 
                onSearch={handleSearch}
                value={searchTerm}
              />
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <Form.Select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {ReferenceCategories.getAllCategories().map(category => (
                    <option key={category} value={category}>
                      {ReferenceCategories.getDisplayName(category)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                onClick={handleClearFilters}
                disabled={activeCategory === 'all' && !searchTerm}
                className="mb-2"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {currentUser && (
        <div className="mb-4 text-end">
          <Button as={Link} to="/references/create" variant="primary">
            Create Reference
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading references...</p>
        </div>
      ) : filteredRefs.length > 0 ? (
        renderReferenceGrid()
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No matching references found</h4>
            <p className="mb-4">
              {activeCategory !== 'all' || searchTerm 
                ? 'Try adjusting your search filters'
                : 'No references are available yet'}
            </p>
            {(activeCategory !== 'all' || searchTerm) && (
              <Button variant="outline-primary" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReferenceList;