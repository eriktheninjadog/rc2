import { Navbar,Container,Nav,NavDropdown } from "react-bootstrap";
import { Switch, Route, Link,NavLink } from "react-router-dom";

const Navigation = () =>
{
    return (
        <Navbar bg="light" expand="lg" sticky="top" >
        <Container>
          <Navbar.Brand href="/">Chinese Reader</Navbar.Brand>
              <Nav.Link href="/import">Import</Nav.Link>
              <Nav.Link href="/reader">Reader</Nav.Link>
              <Nav.Link href="/words">Word Collection</Nav.Link>
        </Container>
      </Navbar>
    );
}

export default Navigation;