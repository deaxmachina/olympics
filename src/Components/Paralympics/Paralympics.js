import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./Paralympics.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';
import dataLoad from "../../data/paralympics.csv";
import dataLoadSports from "../../data/paralympics_sports.csv"
import dataLoadLogos from "../../data/sports_logos.csv"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'
import { annotationCalloutElbow, annotationCalloutCurve, annotation } from "d3-svg-annotation";

// Sources: 
// https://www.britannica.com/sports/Paralympic-Games (annotation)
// https://en.wikipedia.org/wiki/Summer_Paralympic_Games all info for graphs, including logos

const GraphExplain = () => {
  return (
    <div className="graph-explain-container">
    </div>
  )
}

const Paralympics = () => {

  /// refs ///
  const svgRef = useRef();
  const xAxisRef = useRef();
  const gAthletesRef = useRef();
  const gSportsRef = useRef();
  const tooltipRef = useRef();
  const annotationRef = useRef();

  /// states ///
  const [data, setData] = useState(null);
  const [dataSports, setDataSports] = useState(null)
  const [sports, setSports] = useState(null);
  const [sportsLogos, setSportsLogos] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /// constatns ///
  // dimensions 
  const width = 1300;
  const height = 500;
  const margin = {top: 60, right: 20, bottom: 0, left: 40}
  const sportsRadius = 10;
  // colours 
  const barsColour = "#219ebc"
  const axisColour = "#219ebc"
  const sportsLowColour = "#ff006e"
  const sportsHighColour = "#f8961e"


  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setData(d)
    })
    d3.csv(dataLoadSports, d3.autoType).then(d => {
      setDataSports(d)
      const allSports = _.uniq(d.map(el => el.sport))
      setSports(allSports)
    })
    d3.csv(dataLoadLogos, d3.autoType).then(d => {
      setSportsLogos(d)
    })
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (data && dataSports && sports && sportsLogos) {    

      /// Scales ///
      // X Scale - year timeline 
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.1)
      // Y Scale num athletes 
      const yScaleAthletes = d3.scaleLinear()
        .domain([margin.top, d3.max(data, d => d.competitors)])
        .range([height/2, margin.top]) // to the middle of the graphing space 
      // Colour Scale for the sports 
      const colourScaleSports = chroma.scale([sportsLowColour, sportsHighColour]
        .map(colour => chroma(colour).saturate(0)))
        .colors(sports.length)

      /// Axes ///
      // X Axis - the years timeline 
      const xAxis = g => g
        .attr("transform", `translate(${0}, ${height/2 + margin.top})`)
        .call(d3.axisBottom(xScale).tickFormat(i => i).tickSizeOuter(0))
        .call(g => g.select(".domain")
          .attr("color", axisColour)
          .attr("stroke-width", 8)
          .attr("stroke-linecap", "round")
        )
        .call(g => g.selectAll(".tick").selectAll("line").remove())
        .call(g => g.selectAll("text")
          .attr("fill", axisColour)
          .attr("font-size", "18px")
          .attr("font-family", 'Indie Flower, cursive')
        )
        
      // call the axis 
      d3.select(xAxisRef.current).call(xAxis)


      ////////////////////////////////////////////
      /////////// Num Althetes Graph /////////////
      ////////////////////////////////////////////
      // Graphing area
      const gAthletes = d3.select(gAthletesRef.current)
        .attr("transform", `translate(${0}, ${margin.top})`)

      // one group for each bar
      const athleteBarsGroups = gAthletes
        .selectAll(".athlete-bars-groups")
        .data(data)
        .join("g")
        .classed("athlete-bars-groups", true)

      // just a normal bar chart - in front just for click events
      const athletesGraph = athleteBarsGroups
        .selectAll(".athletes-bar")
        .data(d => [d])
        .join("rect")
        .classed("athletes-bar", true)
          .attr("x", d => xScale(d.year))
          .attr("width", xScale.bandwidth())
          .attr("y", d => yScaleAthletes(d.competitors)) 
          .attr("height", d => yScaleAthletes(0) - yScaleAthletes(d.competitors))
          .attr("fill", barsColour)
          .attr("fill-opacity", 0.4)

      // rough bar chart 
      let rcPara = rough.svg(document.getElementById("svg-paralympics"));
      const athletesGraphRough = athleteBarsGroups
        .each(function(d, i) {
          d3.select(this).node()
            .appendChild(
              rcPara.rectangle(
                  xScale(d.year), 
                  yScaleAthletes(d.competitors), 
                  xScale.bandwidth(), 
                  yScaleAthletes(0) - yScaleAthletes(d.competitors), 
                {
                stroke: barsColour,
                strokeWidth: 1.3,
                fillStyle: 'cross-hatch',
                fill: barsColour,
                roughness: 1.5,
          })
          )
        })

      ///////////////////
      ///// Tooltip /////
      ///////////////////
      const tooltip = d3.select(tooltipRef.current)
      athleteBarsGroups
        .on('mouseenter', (e, datum) => {
          tooltip 
          .style('transform', d => `translate(
              ${xScale(+datum.year) - xScale.bandwidth()/2}px,
              ${yScaleAthletes(datum.competitors) - 120}px`
            ) 
          .style("opacity", 1)
          .html(`
            host: ${datum.host} 
            <br/> 
            nations: ${datum.nations} 
            <br/> 
            competitors: ${datum.competitors}
          `)
        })
        .on('mouseleave', () => {
          tooltip.style("opacity", 0)
        })

    /////////////////////
    //// Annotations ////
    /////////////////////
    const type = annotationCalloutCurve
    const annotations = [{
        note: {
          label: "The Paralympics developed after Sir Ludwig Guttmann organized a sports competition for British World War II veterans with spinal cord injuries in England in 1948.",
          title: "Beginnings: 1948"
        },
        dy: -120,
        dx: 50,
        x: 10,
        y: 310,
        color: barsColour,
      }]
    const makeAnnotations = annotation()
      .editMode(false)
      .notePadding(10)
      .type(type)
      .annotations(annotations)

    const myAnnotation = d3.select(annotationRef.current)
      .attr("class", "annotation-group")
      .attr("fill", "hotpink")
      .style("font-size", '14px')
      .style("opacity", 1)
      .call(makeAnnotations)
        

      ////////////////////////////////////////////
      /////////// Num Sports Graph ///////////////
      ////////////////////////////////////////////
      // Graphing area
      const gSports = d3.select(gSportsRef.current)
        .attr("transform", `translate(${0}, ${margin.top + height/2})`)

      // draw one circle for each sport across all the years
      const sportsG = gSports 
        .selectAll(".sports-dot-g")
        .data(dataSports)
        .join("g")
        .classed("sports-dot-g", true)

      const sportsDots = sportsG
        .selectAll(".sports-dot")
        .data(d => [d])
        .join("circle")
        .classed("sports-dot", true)
          .attr("r", sportsRadius)
          .attr("fill", d => colourScaleSports[_.indexOf(sports,d.sport)])
          .attr("fill-opacity", 0.85)
          .attr("stroke", d => colourScaleSports[_.indexOf(sports,d.sport)])
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 1)
          .attr("cx", 0)
          .attr("cy", 0)

      // place logo for that sport in the middle
      const sportsLogo = sportsG  
        .selectAll(".sports-filling")
        .data(d => [d])
        .join("svg:image")
        .classed("sports-filling", true)
          .attr("xlink:href", d => _.find(sportsLogos, el => el.sport == d.sport).logo)
          .attr("width", sportsRadius + 2)
          .attr("height", sportsRadius + 2)
          .attr("transform", `translate(${-sportsRadius/2}, ${-sportsRadius/2})`)


      // simulation 
      function tick() {
        sportsG
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        //.attr("cx", d => d.x)
        //.attr("cy", d => d.y);
      }
      /// define the force ///
      const simulation = d3.forceSimulation(dataSports)
        .force('x', d3.forceX().strength(0.5).x(d => xScale(d.year) + xScale.bandwidth()/2))
        .force('y', d3.forceY().strength(0.1).y((d, i) => (i%22)*2 + 100))
        //.force('y', d3.forceY().strength(0.9).y((d, i) => (d.year%1960)*2 +(i%22) + 50))
        .force("collide", d3.forceCollide(sportsRadius + 1))

      simulation.on("tick", tick)
      tick()


    } 
  }, [data, dataSports, sports, sportsLogos]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-paralympics">
      <h2 className="graph-title-paralympics">What is the history of the Paralympics</h2>
      <button 
        className="graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen} />
        <span className="info-span">info</span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper-paralympics">
        <svg id="svg-paralympics" ref={svgRef} width={width} height={height}>
            <g ref={gAthletesRef} className="g-athletes"></g>
            <g ref={gSportsRef} className="g-sports"></g>
            <g ref={xAxisRef} className="g-axis"></g>
            <g ref={annotationRef}></g>
        </svg>
        <div className="tooltip-paralympics" ref={tooltipRef}>Tooltip</div>
        <div className="paralympics-label-top">participants</div>
        <div className="paralympics-label-bottom">sports</div>
      </div>

    </div>
  )
};

export default Paralympics;