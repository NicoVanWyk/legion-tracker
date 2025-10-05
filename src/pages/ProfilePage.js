// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Profile from '../components/profile/Profile';
import Settings from '../components/profile/Settings';
import UserStats from '../components/profile/UserStats';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL or default to 'profile'
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/stats')) return 'stats';
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/profile/${tab === 'profile' ? '' : tab}`);
  };

  return (
    <Container>
      <h1 className="mb-4">User Profile</h1>
      
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column profile-nav">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'profile'} 
                onClick={() => handleTabChange('profile')}
              >
                Profile Information
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'settings'} 
                onClick={() => handleTabChange('settings')}
              >
                Settings
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'stats'} 
                onClick={() => handleTabChange('stats')}
              >
                Battle Statistics
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        
        <Col md={9}>
          <div className="profile-content p-3 border rounded bg-white">
            {activeTab === 'profile' && <Profile />}
            {activeTab === 'settings' && <Settings />}
            {activeTab === 'stats' && <UserStats />}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;