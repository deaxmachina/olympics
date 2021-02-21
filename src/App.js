import React, {useState} from "react";
import "./App.css";
import FemalePies from "./Components/FemalePies/FemalePies";
import SustainabilityTimeline from "./Components/SustainabilityTimeline/SustainabilityTimeline";
import FirstTimeParticipate from "./Components/FirstTimeParticipate/FirstTimeParticipate"
import Paralympics from "./Components/Paralympics/Paralympics";
import FrontPage from "./Components/FrontPage/FrontPage";
import Footer from "./Components/Footer/Footer"

const App = () => {
  
  return (
    <>
      <FrontPage />
      <FirstTimeParticipate />
      <Paralympics />
      <SustainabilityTimeline />
      <FemalePies />
      <Footer /> 
    </>
  )
};

export default App;