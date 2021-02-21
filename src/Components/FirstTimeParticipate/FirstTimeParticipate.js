// Data from https://en.wikipedia.org/wiki/List_of_participating_nations_at_the_Summer_Olympic_Games

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./FirstTimeParticipate.css";
import dataLoad from "../../data/countries_first_year.json";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faHome } from '@fortawesome/free-solid-svg-icons'
import _ from "lodash"
import chroma from "chroma-js";

const GraphExplain = () => {
  return (
    <div className="graph-explain-container">
      <p>Data source: <a href="https://en.wikipedia.org/wiki/List_of_participating_nations_at_the_Summer_Olympic_Games" target="_blank">Wikipedia</a></p>
      <p className="disclaimer">Use the source to research further. Why did certain countries enter the Olympics later than others? Which countries or regions participated as part of other entities previously; did they welcome the chance to compete in the Olympics independently?</p>
    </div>
  )
}

const FirstTimeParticipate = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const xAxisRef = useRef();
  const playButtonRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();
  const legendAxisRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);

  /// constatns ///
  // dimensions 
  const width = 2000;
  const height = 480;
  const margin = {top: 35, right: 60, bottom: 27, left: 40}


  /// Data load ///
  useEffect(() => {
    setData(dataLoad)
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data) {

      const svg = d3.select(svgRef.current)

      // find the range of years 
      const years = dataLoad.map(d => +d.first_year).sort((a, b) => a - b)

      // special case: countries on multiple continents - Asia and Europe 
      const countriesMultipleContinents = ['Armenia','Azerbaijan','Cyprus','Georgia','Kazakhstan','Russia','Turkey']

      /// Scales ///
      const xScale = d3.scaleBand()
        .domain(years)
        .range([margin.left, width - margin.right])
        .padding(0.1)

      // Colour scale for the continents 
      const continents = _.uniq(data.map(d => d.continent))
      //["Asia", "missing", "Europe", "Africa", "North America", "South America", "Oceania"]
      const continentsColours = {
        "Asia": "#ff006e",
        "Europe": "#81568F",
        "Africa": "#f8961e",
        "North America": "#43aa8b",
        "South America": chroma("#219ebc").saturate(0.5),
        "Oceania": "#90be6d",
        "missing": chroma("#22223b").saturate(0.5)
      }

      // Colour gradient for the counties which are in Europe and Asia 
      const defs = svg.selectAll("defs").data([0]).join("defs")
      const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", "100%")
        .attr("y2", "100%");
      //Set the color for the start (0%)
      linearGradient.append("stop") 
        .attr("offset", "0%")
        .attr("stop-color", continentsColours['Asia']); 
      //Set the color for the end (100%)
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", continentsColours['Europe']); 

      // Set up the start //       
      const startingXPosition = 250 + margin.left;
      const startingYPosition = 150 + margin.top;
      const gNodes = d3.select(gRef.current)
        .attr("transform", `translate(${startingXPosition}, ${startingYPosition})`)

      /// Timeline axis ///
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0)) 
        .call(g => g.select(".domain")
          .attr("color", "#219ebc")
          .attr("stroke-width", 8)
          .attr("stroke-linecap", "round")
        )
        .call(g => g.selectAll(".tick").selectAll("line").remove())
        .call(g => g.selectAll("text")
          .attr("fill", "#219ebc")
          .attr("font-size", "18px")
          .attr("font-family", 'Indie Flower, cursive'))

      d3.select(xAxisRef.current).call(xAxis)


      ////////////////////////
      ////  Force Graph  /////
      ////////////////////////
      const nodes = gNodes
        .selectAll(".node")
        .data(data, d => d) 
        .join("circle")
          .classed("node", true)
          .attr("r", 5) 
          //.attr("fill", d => continentsColours[d.continent])
          .attr("fill", d => (
            countriesMultipleContinents.includes(d.country)
            ? "url(#linear-gradient)"
            : continentsColours[d.continent]
          ))
          .attr("fill-opacity", 0.8)
          .attr("stroke", d => (
            countriesMultipleContinents.includes(d.country)
            ? "url(#linear-gradient)"
            : continentsColours[d.continent]
          ))
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 1)

      function tick() {
        nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
      }

      /// define the force ///
      const simulation = d3.forceSimulation(data)
        // the .strength() for x and y forces can slow them down and speed them up 
        .force("y", d3.forceY((d, i) => height/1.6 - startingYPosition).strength(0.01))
        .force("x", d3.forceX((d, i) =>  xScale(+d.first_year) + xScale.bandwidth()/2 - startingXPosition).strength(0.03))
        .force("collide", d3.forceCollide(10))
        .alphaDecay(0.001) // this makes the collide force more or less gittery
        .on("tick", tick)
        .stop();

      tick();

      ///////////////////
      /// Play button ///
      ///////////////////
      const playButton = d3.select(playButtonRef.current)
        .on("click", function() {
          setTimeout(() => {
            simulation.restart();
            nodes.transition().attr("r", r => 6);
          }, 500);
        })

      ///////////////////
      ///// Tooltip /////
      ///////////////////
      const tooltip = d3.select(tooltipRef.current)
      nodes
      .on('mouseenter', (e, datum) => {
        tooltip 
        .style('transform', d => `translate(
            ${xScale(+datum.first_year)}px,
            ${120}px`
          ) 
        .style("opacity", 1)
        .text(`${datum.country} ${datum.first_year}`)
      })
      .on('mouseleave', () => {
        tooltip.style("opacity", 0)
      })

      ///////////////////
      ///// Legend //////
      ///////////////////
      const legendG = d3.select(legendRef.current)
        .attr("transform", `translate(${0}, ${margin.top})`)
      
      const legendScale = d3.scaleBand()
        .domain(Object.keys(continentsColours))
        .range([width/2.5, width/1.8])

      // Groups for each circle-continent paid 
      const legendGroups = legendG
        .selectAll(".legend-group")
        .data(Object.keys(continentsColours))
        .join("g")
        .classed("legend-group", true)
        .attr("transform", d => `translate(${legendScale(d) + legendScale.bandwidth()/2}, ${0})`)

      // Title on top of the legend 
      const legendTitle = legendG
        .selectAll(".legend-title")
        .data(['each circle = country, coloured by continent; click to filter'])
        .join("text")
        .classed("legend-text", true)
        .text(d => d)
        .attr("transform", `translate(${width/2.5 - 25}, ${-28})`)
        .attr("dy", "0.35em")
        .style("fill", "#219ebc")
      
      // Circles for the legend 
      const legendCircles = legendGroups 
        .selectAll(".legend-circle")
        .data(d => [d])
        .join("circle")
        .classed("legend-circle", true)
          .attr("r", 10)
          .attr("fill", d => continentsColours[d])
          .attr("fill-opacity", 0.8)
          .attr("stroke", d => continentsColours[d])
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 1)


      // X Axis 
      const legendXAxis = g => g
        .call(d3.axisBottom(legendScale).tickFormat(
          i => i == "missing" ? "no longer exists / renamed / other" : i
        ))
        .attr("transform", `translate(${0}, ${45})`)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll("text")
          .attr("transform", `rotate(-30)`)
          .attr("text-anchor", "end")
          .style("fill", d => continentsColours[d])
          .attr("font-family", 'Indie Flower, cursive')
          .style("font-size", "1.2em")
        )
        .call(g => g.selectAll(".tick")
          .style("color", d => continentsColours[d])
        )

      d3.select(legendAxisRef.current).call(legendXAxis)

      // Events on the legend 
      legendCircles
        .on("click", function(e, datum) {
          legendCircles
            .attr("fill-opacity", d => d == datum ? 0.8 : 0.06)
            .attr("stroke-opacity", d => d == datum ? 1 : 0.1)
          d3.select(legendAxisRef.current).call(legendXAxis)
            .call(g => g.selectAll(".tick")
            .style("opacity", d => d == datum ? 1 : 0.06)
          )
          nodes
            .attr("fill-opacity", d => 
            d.continent == datum ? 0.8 : 0.06
            )
            .attr("stroke-opacity", d => d.continent == datum ? 1 : 0.1)
        })


        // for the event where we restore the opacity when we click outisde the legend 
        svg
          .on("click",function(e, datum){
            // check if the click ocurred on the target or not 
            // if it's "false" then the click did not happen on the target 
            console.log(e.target)
            console.log(this == e.target)
            if (this == e.target) {
              legendCircles
                .attr("fill-opacity", 0.8)
                .attr("stroke-opacity", 1)
              d3.select(legendAxisRef.current).call(legendXAxis)
                .call(g => g.selectAll(".tick")
                .style("opacity", 1)
              ) 
              nodes
                .attr("fill-opacity", 0.8)
                .attr("stroke-opacity", 1)
            }
        });


      



    } 
  }, [data]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-first-time" id="first-time">
      <h2 className="graph-title graph-title-first-time">When did countries first participate in the Olympics?</h2>
      <div className="mascot-first-time"></div>

      <button className="icon home-icon">
        <a href="#home" className="home-first-time"><FontAwesomeIcon icon={faHome}/></a>
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

      <div className="wrapper wrapper-first-time">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
          <g ref={xAxisRef}></g>
          <g ref={legendRef}></g>
          <g ref={legendAxisRef}></g>
        </svg>
        <div className="play-button-first-time" ref={playButtonRef}>play</div>
        <div className="tooltip-first-time" ref={tooltipRef}>Tooltip</div>
      </div>

    </div>
  )
};

export default FirstTimeParticipate;