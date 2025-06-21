//Adventure.js


import AudioAdventurePlayer from "./AudioAdventurePlayer";
import { Button, Container } from "react-bootstrap";

import Navigation from "./Navigation";

const Adventure = ()=> {

    return (

<div>
<Container>
    <Navigation></Navigation>
<h1>Adventure</h1> 
<br></br>
<AudioAdventurePlayer></AudioAdventurePlayer>
</Container>
</div>

    );
}

export default Adventure;