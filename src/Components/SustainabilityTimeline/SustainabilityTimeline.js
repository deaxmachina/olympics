// Data from https://www.researchgate.net/publication/340446440_ENVIRONMENTAL_SUSTAINABILITY_OF_OLYMPIC_GAMES_A_NARRATIVE_REVIEW_OF_EVENTS_INITIATIVES_IMPACT_AND_HIDDEN_ASPECTS

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./SustainabilityTimeline.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';
import dataLoad from "../../data/environmental_cal.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faLaughBeam, faHome } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <div className="graph-explain-container">
      <p>Data source: <a href="https://www.researchgate.net/publication/340446440_ENVIRONMENTAL_SUSTAINABILITY_OF_OLYMPIC_GAMES_A_NARRATIVE_REVIEW_OF_EVENTS_INITIATIVES_IMPACT_AND_HIDDEN_ASPECTS" target="_blank">
        "Maria Konstantaki (2018) "Environmental Sustainability of Olympic Games: a Narrative Review of Events, Initiatives, Impact and Hidden Aspects"
        </a>
      </p>
      <p className="disclaimer"> 
        Timeline of major positive and negative environmental events/initiatives/outcomes at or related to the Olympics. Based on events described in paper by Maria Konstantaki (2018). 
      </p>
      <p className="disclaimer"> 
        What do you think the positive and negative environmental impact of the Olympics is? Do you know about the recycling efforts for Tokyo 2020? Why do you think the medals were made from recycled electronics, for example? What would you do if you were organising the games to ensure they have a positive impact? 
      </p>
    </div>
  )
}

const SustainabilityTimeline = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const gRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /// constatns ///
  // dimensions 
  const width = 1100;
  const height = 500;
  const margin = {top: 20, right: 50, bottom: 0, left: 50}
  // colours 
  const positiveColour = chroma("#43aa8b").saturate(1)
  const negativeColour = chroma("#f8961e").saturate(1)
  const greenColour = "#43aa8b"


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      let rc = rough.svg(document.getElementById("svg-sustainability-timeline"));

      /// Scales ///
      // X Scale - year timeline 
      const xScale = d3.scalePoint()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])


      /// Axes ///
      // X Axis - the years timeline 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height/1.5})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain")
          .attr("color", greenColour)
          .attr("stroke-width", 8)
          .attr("stroke-linecap", "round")
        )
        .call(g => g.selectAll(".tick").selectAll("line").remove())
        .call(g => g.selectAll("text")
          .attr("fill", greenColour)
          .attr("font-size", "18px")
          .attr("font-family", 'Indie Flower, cursive')
        )
        
      // call the axis 
      d3.select(xAxisRef.current).call(xAxis)

      /// Graph ///
      // Graphing area
      const g = d3.select(gRef.current)
      .attr("transform", `translate(${0}, ${height/1.5})`)

      // one group for each event
      const timelineLinesGroups = g
        .selectAll(".timeline-lines")
        .data(data)
        .join("g")
        .classed("timeline-lines", true)
          .attr("transform", d => `translate(${xScale(d.year)}, ${0})`)

      // draw lines extending from the year when each event happend 
      // either up or down depending on whether the event outcome 
      // was positive or negative
      const timelineLines = timelineLinesGroups
        .append("line")
          .attr("y1", 0)
          .attr("y2", d => 
          (d.polarity == "negative") 
            ? 100
            : d.olympics == "no"
            ? -200
            : -100
          )
          .attr("stroke", "white")
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "1 1")


      // draw one shape (circle) for each event that happened
      // use conditionals to change the colour or the pattern of the fill 
      // based on whether the even was an olympics or good or bad outcome
      const eventShapes = timelineLinesGroups
        .each(function(d, i) {
          
          d3.select(this).node()
            .appendChild(
              rc.circle(0, 
                d.polarity == "negative"
                ? 100
                : d.olympics == "no"
                  ? -200
                : -100, 
                80, {
                stroke: d.polarity == 'negative' ? negativeColour : positiveColour,
                strokeWidth: 1.7,
                fillStyle: d.olympics == 'no' ? 'zigzag-line' : 'cross-hatch',
                fill: d.polarity == 'negative' ? negativeColour : positiveColour,
                roughness: 2,
          })
          )
        })


      // Add a normal circle behind each rough circle just for the hover events
      const eventCircles = timelineLinesGroups
        .selectAll(".event-circle")
        .data(d => [d])
        .join("circle")
        .classed("event-circle", true)
          .attr("cx", 0)
          .attr("cy", d => d.polarity == "negative"? 100 : d.olympics == "no" ? -200 : -100)
          .attr("r", 40)
          .attr("opacity", 0.5)
          .attr("fill", d => d.polarity == 'negative' ? negativeColour : positiveColour)


      /// Tooltip ///
      const tooltip = d3.select(tooltipRef.current)
      eventCircles
      .on('mouseenter', (e, datum) => {
        console.log(datum)
        setSelectedEvent(datum)
        tooltip 
        .style('transform', d => `translate(
            ${xScale(datum.year)}px,
            ${
              datum.polarity == "negative"
              ? 100 + 100
              : datum.olympics == "no"
                ? -200 + 100
              : -100 + 100
            }px`
          ) 
        .style("opacity", 1)
      })
      .on('mouseleave', () => {
        tooltip.style("opacity", 0)
      })

      /////////////////////
      ///// legend ///////
      ///////////////////

      const legend = d3.select(legendRef.current)

      // positive outcome 
      legend.each(function(d, i) {
        d3.select(this).node()
          .appendChild(
            rc.circle(width - margin.right - 160, margin.top, 20, {
              stroke: positiveColour,
              strokeWidth: 1,
              fillStyle: 'cross-hatch',
              fill: positiveColour,
              roughness: 1.7,
          })
        )
      }) 
      legend.selectAll(".legend-label-positive").data(['positive outcome']).join("text")
        .classed("legend-label-positive", true)
        .text(d => d)
        .attr("transform", `translate(${width - margin.right - 290}, ${margin.top})`)
        .attr("dy", "0.35em")
        .style("fill", positiveColour)

      // negative outcome 
      legend.each(function(d, i) {
        d3.select(this).node()
          .appendChild(
            rc.circle(width - margin.right, margin.top, 20, {
              stroke: negativeColour,
              strokeWidth: 1,
              fillStyle: 'cross-hatch',
              fill: negativeColour,
              roughness: 1.7,
          })
        )
      })   
      legend.selectAll(".legend-label-negative").data(['negative outcome']).join("text")
        .classed("legend-label-negative", true)
        .text(d => d)
        .attr("transform", `translate(${width - margin.right - 130}, ${margin.top})`)
        .attr("dy", "0.35em")
        .style("fill", negativeColour)     



    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-sustainability-timeline" id="environment">
      <div className="mascot-sustainability-timeline"></div>
      <h2 className="graph-title graph-title-sustainability-timeline">How do the Olympics impact the environment?</h2>

      <button className="icon home-icon">
        <a href="#home" className="home-sustainability-timeline"><FontAwesomeIcon icon={faHome}/></a>
        <span className="info-span"></span>
      </button>  

      <button 
        className="icon graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} />
        <span className="info-span"></span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper-sustainability-timeline">
        <svg id="svg-sustainability-timeline" ref={svgRef} width={width} height={height}>
            <g ref={gRef}></g>
            <g ref={xAxisRef}></g>
            <g ref={legendRef}></g>
        </svg>
        <div className="tooltip-sustainability-timeline" ref={tooltipRef}>
          { selectedEvent ?
           <div>
             {selectedEvent.polarity === "positive" ? 
              <>
                <span className="tooltip-sustainability-timeline-title tooltip-sustainability-timeline-pos"><FontAwesomeIcon icon={faLaughBeam} /></span>
                <span className="tooltip-sustainability-timeline-title tooltip-sustainability-timeline-pos">{selectedEvent.event}</span>
              </>
             : 
              <>
                <span className="tooltip-sustainability-timeline-title tooltip-sustainability-timeline-neg">{selectedEvent.event}</span>
              </>
             }
              <span className="tooltip-sustainability-timeline-info">{selectedEvent.notes}</span>     
            </div> 
            : null
          }
        </div>
      </div>

    </div>
  )
};

export default SustainabilityTimeline;