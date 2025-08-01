//Adventure.js


import ChooseYourOwnAdventure from "./ChooseYourOwnAdventure";
import { Button, Container } from "react-bootstrap";

import { ActivityTimeDisplay } from "./ActivityTimeDisplay";

import Navigation from "./Navigation";

const Adventure = ()=> {

    return (


<div>
<Container>
    <Navigation></Navigation>
<h1>Adventure</h1> 
<ActivityTimeDisplay activityName="Adventure" />
<br></br>
<ChooseYourOwnAdventure></ChooseYourOwnAdventure>
</Container>
</div>

    );
}

export default Adventure;