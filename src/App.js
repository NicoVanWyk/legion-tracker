// src/App.js (Updated with all new routes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Units from './pages/Units';
import Armies from './pages/Armies';
import Battles from './pages/Battles';
import ReferencePage from './pages/ReferencePage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Custom Keywords
import CustomKeywordList from './components/custom/CustomKeywordList';
import CustomKeywordForm from './components/custom/CustomKeywordForm';

// Custom Unit Types
import CustomUnitTypeList from './components/custom/CustomUnitTypeList';
import CustomUnitTypeForm from './components/custom/CustomUnitTypeForm';

// Abilities
import AbilityList from './components/abilities/AbilityList';
import AbilityForm from './components/abilities/AbilityForm';

// Upgrades
import UpgradeCardList from './components/upgrades/UpgradeCardList';
import UpgradeCardForm from './components/upgrades/UpgradeCardForm';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css'; // Custom styles

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="d-flex flex-column min-vh-100">
                    <Header />

                    <Container className="flex-grow-1 mb-4">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Reference Routes - Public Access for Viewing */}
                            <Route path="/references" element={<ReferencePage />} />
                            <Route path="/references/:id" element={<ReferencePage />} />

                            {/* Private Routes */}
                            <Route element={<PrivateRoute />}>
                                {/* Units Routes */}
                                <Route path="/units" element={<Units />} />
                                <Route path="/units/:unitId" element={<Units />} />
                                <Route path="/units/create" element={<Units />} />
                                <Route path="/units/edit/:unitId" element={<Units />} />

                                {/* Custom Keywords Routes */}
                                <Route path="/units/keywords" element={<CustomKeywordList />} />
                                <Route path="/units/keywords/create" element={<CustomKeywordForm />} />
                                <Route path="/units/keywords/edit/:keywordId" element={<CustomKeywordForm />} />

                                {/* Custom Unit Types Routes */}
                                <Route path="/units/types" element={<CustomUnitTypeList />} />
                                <Route path="/units/types/create" element={<CustomUnitTypeForm />} />
                                <Route path="/units/types/edit/:typeId" element={<CustomUnitTypeForm />} />

                                {/* Army Routes */}
                                <Route path="/armies" element={<Armies />} />
                                <Route path="/armies/:armyId" element={<Armies />} />
                                <Route path="/armies/create" element={<Armies />} />
                                <Route path="/armies/edit/:armyId" element={<Armies />} />

                                {/* Battle Routes */}
                                <Route path="/battles" element={<Battles />} />
                                <Route path="/battles/:battleId" element={<Battles />} />
                                <Route path="/battles/create" element={<Battles />} />
                                <Route path="/battles/edit/:battleId" element={<Battles />} />

                                {/* Abilities Routes */}
                                <Route path="/abilities" element={<AbilityList />} />
                                <Route path="/abilities/create" element={<AbilityForm />} />
                                <Route path="/abilities/edit/:abilityId" element={<AbilityForm />} />

                                {/* Upgrade Cards Routes */}
                                <Route path="/upgrades" element={<UpgradeCardList />} />
                                <Route path="/upgrades/create" element={<UpgradeCardForm />} />
                                <Route path="/upgrades/edit/:upgradeId" element={<UpgradeCardForm />} />

                                {/* References Creation/Edit Routes - Authenticated Only */}
                                <Route path="/references/create" element={<ReferencePage />} />
                                <Route path="/references/edit/:id" element={<ReferencePage />} />

                                {/* Profile Routes */}
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/profile/settings" element={<ProfilePage />} />
                                <Route path="/profile/stats" element={<ProfilePage />} />
                            </Route>

                            {/* Home page is accessible to everyone */}
                            <Route path="/" element={<Home />} />

                            {/* 404 Route */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Container>

                    <Footer />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;