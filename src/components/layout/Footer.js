import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <Container>
        <p className="text-center mb-0">
          Star Wars Legion Tracker © {new Date().getFullYear()}
        </p>
      </Container>
    </footer>
  );
};

export default Footer;