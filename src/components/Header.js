import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">Brand</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Cards" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/cards/pokemon">
                Pokémon
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cards/yugioh">
                Yu-Gi-Oh!
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/user">
              User
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
