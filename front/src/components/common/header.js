import { Link } from 'react-router-dom';
import {Container, Nav, Navbar} from "react-bootstrap";

export default function Header() {
    return (
        <div>
            <Navbar bg="light" variant="light">
                <Container>
                    <Navbar.Brand href="#home">Freshly Cosmetics</Navbar.Brand>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#features">Home</Nav.Link>
                        </Nav>
                        <Nav>
                            <Nav.Link href="#deets">Federico Suárez</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
}