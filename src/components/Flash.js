//Adventure.js


import FlashcardGame from "./FlashCardGame";
import React from "react";
import { Button, Container } from "react-bootstrap";

import { ActivityTimeDisplay } from "./ActivityTimeDisplay";

import Navigation from "./Navigation";

const Flash = ()=> {

    return (


<div>
<Container>
    <Navigation></Navigation>
<h1>Flashcard</h1> 
<ActivityTimeDisplay activityName="Adventure" />
<br></br>
<FlashcardGame/>
</Container>
</div>

    );
}

export default Flash;