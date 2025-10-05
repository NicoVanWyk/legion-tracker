// src/components/profile/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [settings, setSettings] = useState({
    theme: 'light',
    defaultFaction: 'republic',
    defaultPointValue: 800,
    enableBattleNotifications: true
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          
          if (userData.preferences) {
            setSettings({
              theme: userData.preferences.theme || 'light',
              defaultFaction: userData.preferences.defaultFaction || 'republic',
              defaultPointValue: userData.preferences.defaultPointValue || 800,
              enableBattleNotifications: userData.preferences.enableBattleNotifications !== false
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load settings. Please try again later.');
        console.error('Error fetching user settings:', error);
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, {
        'preferences.theme': settings.theme,
        'preferences.defaultFaction': settings.defaultFaction,
        'preferences.defaultPointValue': Number(settings.defaultPointValue),
        'preferences.enableBattleNotifications': settings.enableBattleNotifications,
        updatedAt: new Date()
      });
      
      setSuccess('Settings saved successfully');
      
      // Apply theme immediately if changed
      document.documentElement.setAttribute('data-bs-theme', settings.theme);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-editor">
      <h3 className="mb-4">Application Settings</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>Display Preferences</Card.Header>
          <Card.Body>
            <Form.Group controlId="theme" className="mb-3">
              <Form.Label>Theme</Form.Label>
              <Form.Select
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose your preferred application theme
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>Game Preferences</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="defaultFaction" className="mb-3">
                  <Form.Label>Default Faction</Form.Label>
                  <Form.Select
                    name="defaultFaction"
                    value={settings.defaultFaction}
                    onChange={handleChange}
                  >
                    <option value="republic">Republic</option>
                    <option value="separatist">Separatist</option>
                    <option value="rebel">Rebel Alliance</option>
                    <option value="empire">Galactic Empire</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Your most frequently used faction
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="defaultPointValue" className="mb-3">
                  <Form.Label>Default Point Value</Form.Label>
                  <Form.Control
                    type="number"
                    name="defaultPointValue"
                    value={settings.defaultPointValue}
                    onChange={handleChange}
                    min="200"
                    max="2000"
                    step="50"
                  />
                  <Form.Text className="text-muted">
                    Standard army point value for new battles
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>Notifications</Card.Header>
          <Card.Body>
            <Form.Group controlId="enableBattleNotifications" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Battle Notifications"
                name="enableBattleNotifications"
                checked={settings.enableBattleNotifications}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Receive notifications about battle updates and reminders
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-end mt-4">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={saving}
            className="d-flex align-items-center"
          >
            {saving && (
              <Spinner 
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Settings;