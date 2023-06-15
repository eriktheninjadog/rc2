import { Navbar,Container,Nav,NavDropdown } from "react-bootstrap";
import { Switch, Route, Link,NavLink } from "react-router-dom";

const Navigation = () =>
{
    return (
        <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Chinese Reader</Navbar.Brand>
              <Nav.Link href="/import">Import</Nav.Link>
              <Nav.Link href="/texts">Texts</Nav.Link>
              <Nav.Link href="/reader">Reader</Nav.Link>
              <Nav.Link href="/flash">Flash</Nav.Link>
        </Container>
      </Navbar>
    );
}

export default Navigation;