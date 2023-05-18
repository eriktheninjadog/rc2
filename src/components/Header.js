import logo from '../logo.svg';

import {
  Container, Row, Col, Form, Input, Button, Navbar, Nav,
  NavbarBrand, NavLink, NavItem, UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem
} from 'reactstrap';

const Header = () => (
  <header>
    <Navbar fixed="top" color="light" light expand="xs" className="border-bottom border-gray bg-white" style={{ height: 80 }}>
      <Container>
        <Row noGutters className="position-relative w-100 align-items-center">
          <Col className="d-none d-lg-flex justify-content-start">
            <Nav className="mrx-auto" navbar>
              <NavItem className="d-flex align-items-center">
                <NavLink className="font-weight-bold" href="/">
                  <img src={AVATAR} alt="avatar" className="img-fluid rounded-circle" style={{ width: 36 }} />
                </NavLink>
              </NavItem>
              <NavItem className="d-flex align-items-center">
                <NavLink className="font-weight-bold" href="/">Home</NavLink>
              </NavItem>
              <NavItem className="d-flex align-items-center">
                <NavLink className="font-weight-bold" href="/">Events</NavLink>
              </NavItem>
            </Nav>
          </Col>
          <Col className="d-flex justify-content-xs-start justify-content-lg-center">
            <NavbarBrand className="d-inline-block p-0" href="/" style={{ width: 80 }}>
              <img src={logo} alt="logo" className="position-relative img-fluid" />
            </NavbarBrand>
          </Col>
          <Col className="d-none d-lg-flex justify-content-end">
            <Form inline>
              <Input type="search" className="mr-3" placeholder="Search React Courses" />
              <Button type="submit" color="info" outline>Search</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Navbar>
  </header>
);

export default Header;