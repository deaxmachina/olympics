import React, {useState} from "react";
import "./App.css";
import FemalePies from "./Components/FemalePies/FemalePies";
import SustainabilityTimeline from "./Components/SustainabilityTimeline/SustainabilityTimeline";
import FirstTimeParticipate from "./Components/FirstTimeParticipate/FirstTimeParticipate"
import Pie from "./Components/FemalePies/Pie";

const App = () => {
  
  return (
    <>
      <h1>Olympic Games Evolution</h1>
      <FirstTimeParticipate />
      <SustainabilityTimeline />
      <FemalePies />

      
    </>
  )
};

export default App;