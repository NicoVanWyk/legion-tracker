import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Badge, Form, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useGameSystem } from '../../contexts/GameSystemContext';
import AoSContentTypes from '../../enums/aos/AoSContentTypes';
import AoSFactions from '../../enums/aos/AoSFactions';
import GameSystems from '../../enums/GameSystems';
import LoadingSpinner from '../layout/LoadingSpinner';

const ArmyContentList = () => {
  const { currentUser } = useAuth();
  const { currentSystem } = useGameSystem();
  const navigate = useNavigate();
  
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContent();
  }, [currentUser, currentSystem]);

  useEffect(() => {
    filterContent();
  }, [content, filterType, searchTerm]);

  const fetchContent = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const contentRef = collection(db, 'users', currentUser.uid, 'armyContent');
      const q = query(contentRef, where('gameSystem', '==', GameSystems.AOS));
      const snapshot = await getDocs(q);

      const contentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setContent(contentList);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.contentType === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }

    setFilteredContent(filtered);
  };

  const handleDelete = async (contentId) => {
    if (!window.confirm('Delete this content?')) return;

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'armyContent', contentId));
      setContent(content.filter(c => c.id !== contentId));
    } catch (err) {
      console.error('Error deleting:', err);
      setError('Failed to delete');
    }
  };

  if (currentSystem !== GameSystems.AOS) {
    return (
      <Alert variant="info">
        <h4>Army Content is only available for Age of Sigmar</h4>
      </Alert>
    );
  }

  if (loading) return <LoadingSpinner text="Loading content..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Army Content</h2>
        <Button as={Link} to="/army-content/create" variant="primary">
          <i className="bi bi-plus-circle me-2"></i>
          Create Content
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Control
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {AoSContentTypes.getAllTypes().map(type => (
                  <option key={type} value={type}>
                    {AoSContentTypes.getDisplayName(type)}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => { setFilterType('all'); setSearchTerm(''); }}
                className="w-100"
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredContent.length === 0 ? (
        <Alert variant="info">
          No content found. Create your first army content item!
        </Alert>
      ) : (
        <ListGroup>
          {filteredContent.map(item => (
            <ListGroup.Item key={item.id}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <i className={`${AoSContentTypes.getIcon(item.contentType)} me-2`} style={{ color: AoSContentTypes.getColor(item.contentType) }}></i>
                    <h5 className="mb-0">{item.name}</h5>
                    <Badge bg="secondary" className="ms-2">
                      {AoSContentTypes.getDisplayName(item.contentType)}
                    </Badge>
                    {item.faction && (
                      <Badge bg="primary" className="ms-2">
                        {AoSFactions.getDisplayName(item.faction)}
                      </Badge>
                    )}
                    {item.pointsCost > 0 && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        {item.pointsCost} pts
                      </Badge>
                    )}
                  </div>
                  <p className="mb-1 small text-muted">{item.description}</p>
                  {item.restrictions?.length > 0 && (
                    <div className="mt-1">
                      <small className="text-muted">Restrictions: {item.restrictions.join(', ')}</small>
                    </div>
                  )}
                </div>
                <div className="d-flex">
                  <Button
                    as={Link}
                    to={`/army-content/edit/${item.id}`}
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default ArmyContentList;