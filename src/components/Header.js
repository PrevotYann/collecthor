import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">CollecThor</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Cards" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/cards">
                Search
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cards/pokemon">
                Pokémon
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cards/yugioh">
                Yu-Gi-Oh!
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/cards/fftcg">
                FF TCG
              </NavDropdown.Item>
            </NavDropdown>
            {user ? (
              <>
                <Nav.Link as={Link} to="/user">
                  {user.username}
                </Nav.Link>
                <Nav.Link onClick={logout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
