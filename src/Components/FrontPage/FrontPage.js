import React from "react"; 
import "./FrontPage.css";

const FrontPage = () => {
  return (
    <div className="container-front-page">
      <div className="title-decoration-front-page">
        <div className="olympic-circle"></div>
        <div className="olympic-circle"></div>
        <h1 className="title-front-page">Olympics & Paralympics Facts and Legacy</h1>
        <div className="olympic-circle"></div>
        <div className="olympic-circle"></div>
      </div>

      <div className="content-front-page">
        <div className="explanation-front-page">
          Materials for a collaborative project between the Universites of Tokyo and Tsukuba on the topic of "School Trip Around the Olympics Sports Museum". The questions and accompanying visualisations serve the purpose of cues for group discussions among the students before they visit the museum. They aim to bring up important topics around the history and goals of the Olympics and Paralympics, aimed at secondary school students in Japan. This is a rough draft =) 
        </div>
        <div className="contents-list-front-page">
          <h2 className="contents-label-front-page">Contents</h2>
          <p>When did countries first participate in the Olympics?</p>
          <p>What is the history and timeline of the Paralympics?</p>
          <p>What is the athlete gender split at the Olympics?</p>
          <p>How do the Olympics impact the environment?</p>
        </div>
      </div>


    </div>
  )
};

export default FrontPage;