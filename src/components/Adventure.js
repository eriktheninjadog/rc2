//Adventure.js


import ChooseYourOwnAdventure from "./ChooseYourOwnAdventure";
import { Button, Container } from "react-bootstrap";

import Navigation from "./Navigation";

const Adventure = ()=> {

    return (


<div>
<Container>
    <Navigation></Navigation>
<h1>Adventure</h1> 
<br></br>
<ChooseYourOwnAdventure></ChooseYourOwnAdventure>
</Container>
</div>

    );
}

export default Adventure;