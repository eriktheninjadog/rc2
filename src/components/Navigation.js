import { Navbar,Container,Nav,NavDropdown } from "react-bootstrap";
import { Switch, Route, Link,NavLink } from "react-router-dom";

import { Timer, TimerState } from "./backendapi/timer";
const Navigation = () =>
{

  if (window.timer == undefined)
    window.timer  = new Timer("https://chinese.eriktamm.com/api/addoutputexercise")


  const startManualTime = event => {
    window.timer.start();
  }

  const stopManualTime = event => {
    window.timer.pause();
  }



    return (
        <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="/">Chinese Reader</Navbar.Brand>
            <button onClick={() => startManualTime()}>M sta</button>
          <button onClick={() => stopManualTime()}>M sto</button>
        
              <Nav.Link href="/import">Import</Nav.Link>
              <Nav.Link href="/audioadventure">AudioAdventure</Nav.Link>
              <Nav.Link href="/adventure">Adventure</Nav.Link>
              <Nav.Link href="/coach">Coach</Nav.Link>
              <Nav.Link href="/video">Video</Nav.Link>
              <Nav.Link href="/output">Output</Nav.Link>
        </Container>
      </Navbar>
    );
}

export default Navigation;