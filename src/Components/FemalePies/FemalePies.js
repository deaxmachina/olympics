import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./FemalePies.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';
import dataLoad from "../../data/female_summer_olympics.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faHome } from '@fortawesome/free-solid-svg-icons'
import Pie from "./Pie";

const GraphExplain = () => {
  return (
    <div className="graph-explain-container">
      <p>Data source: <a href="https://stillmed.olympic.org/media/Document%20Library/OlympicOrg/Factsheets-Reference-Documents/Women-in-the-Olympic-Movement/Factsheet-Women-in-the-Olympic-Movement.pdf" target="_blank">IOC</a></p>
      <p className="disclaimer">Female and male participation in the Summer Olympics; numbers are approximate.</p>
      <p className="disclaimer">Why do you think the female athlete participation in the Olympics used to be so low? What has changed? What do you think will happen in the future?</p>
    </div>
  )
}

const FemalePies = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const legendRef = useRef();

  /// states ///
  const [dataAll, setDataAll] = useState(null);
  const [revealGraphExplanation, setRevealGraphExplanation] = useState(false);
  const [show, setShow] = useState(false)

  /// constatns ///
  // dimensions 
  const height = 600 + 70;
  const width = 1170;
  const margin = {top: 20, right: 100, bottom: 0, left: 0}
  // for the pies 
  const pieSize = 145; 
  const innerRadius = 23;
  const outerRadius = pieSize/2 - 10;
  const padAngle = 0.1;
  const conerRadius = 15;
  // colours 
  const colourFemale = chroma("#ff006e").saturate(0)
  const colourMale = chroma("#219ebc").saturate(2)

  /// Data load ///
  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      setDataAll(d)
    });
  }, []);

  /// D3 Code ///
  useEffect(() => {
    if (dataAll) {

      // compute all the years 
      const years = dataAll.map(d => d.year)

      /////////////////////////////////////////////
      /////////// Rough JS Define /////////////////
      /////////////////////////////////////////////
      let rc = rough.svg(document.getElementById("svg-female-pies"));


      /////////////////////////
      //// Legend on top /////
      /////////////////////////
      const legend = d3.select(legendRef.current)

      // female
      legend.each(function(d, i) {
        d3.select(this).node()
          .appendChild(
            rc.circle(width - margin.right - 20, margin.top, 20, {
              stroke: colourFemale,
              strokeWidth: 1,
              fillStyle: 'zigzag',
              fill: colourFemale,
              roughness: 1.7,
          })
        )
      }) 
      legend.selectAll(".legend-label-female").data(['female']).join("text")
        .classed("legend-label-female", true)
        .text(d => d)
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`)
        .attr("dy", "0.35em")
        .style("fill", colourFemale)

      // male
      legend.each(function(d, i) {
        d3.select(this).node()
          .appendChild(
            rc.circle(width - margin.right - 100, margin.top, 20, {
              stroke: colourMale,
              strokeWidth: 1,
              fillStyle: 'cross-hatch',
              fill: colourMale,
              roughness: 1.7,
          })
        )
      }) 
      legend.selectAll(".legend-label-male").data(['male']).join("text")
        .classed("legend-label-male", true)
        .text(d => d)
        .attr("transform", `translate(${width - margin.right - 85}, ${margin.top})`)
        .attr("dy", "0.35em")
        .style("fill", colourMale)



      /////////////////////////////////////////////
      //////////////// Graph //////////////////////
      /////////////////////////////////////////////
      const svgD3 = d3.select(svgRef.current).attr("width", width).attr("height", height);
      // 1. Pie
      // this is what you use on the data
      const pie = d3
        .pie()
        .sort(null)
        .value((d) => d.percentage);

      // 2. Arc
      // this is what you use when drawing the graph
      // it becomes the d attribute of paths
      const arc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(padAngle)
        .cornerRadius(conerRadius);
      // Graph area
      const g = d3.select(gRef.current)
        .attr("transform", `translate(${0}, ${70})`)

      // helper function to position on the grid
      const perRow = 8; 
      const calculateGridPos = (i) => {
        return [(i % perRow + 0.5) * pieSize, (Math.floor(i / perRow) + 0.5) * pieSize]
      }

      const groups = g.selectAll("g")
        .data(years.slice(0, 28))
        .join("g")
          .attr("transform", (d, i) => `translate(
            ${calculateGridPos(i)[0]},
            ${calculateGridPos(i)[1]}
          )`)

      // postion text with the year in the middle of each pie
      const pieChartsText = groups
        .append("text")
        .text(d => d)
        .attr("class", "pie-text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("fill", colourFemale)

      // draw the pie chart
      const pieCharts = groups
        .each(function(d, i) {

          // filter just the data for the selected year
          const dataForYear =  _.filter(dataAll, element => element.year == d)
          const dataForYearTransformed = [
            {gender: "male", percentage: 100 - dataForYear[0].proportion},
            {gender: "female", percentage: dataForYear[0].proportion}
          ]
          
          // rough pie chart 
          d3.select(this).node()
          // draw part for the male 
            .appendChild(
              rc.path(arc(pie(dataForYearTransformed)[0]), {
                stroke: colourMale,
                strokeWidth: 1,
                fillStyle: 'cross-hatch',
                fill: colourMale,
                roughness: 2.5,
          }))
          // draw part for the female 
            .appendChild(
              rc.path(arc(pie(dataForYearTransformed)[1]), {
                stroke: colourFemale,
                strokeWidth: 0.8,
                fillStyle: 'zigzag',
                fill: colourFemale,
                roughness: 2.2,
          }))
        });

    } 
  }, [dataAll, show]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-female-pies" id="gender">
      <h2 className="graph-title graph-title-female-pies">What is the athlete gender split at the Olympics?</h2>
      <div className="mascot-female-pies"></div>

      <button className="icon home-icon">
        <a href="#home" className="home-female-pies"><FontAwesomeIcon icon={faHome}/></a>
        <span className="info-span"></span>
      </button>  

      <button 
        className="icon graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen}/>
        <span className="info-span"></span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      {
        !show ? <Pie show={show} setShow={setShow}/> : null
      }
      {
        show ?
          <div className="wrapper wrapper-female-pies">
            <svg id="svg-female-pies" ref={svgRef} width={width} height={height}>
              <g ref={legendRef}></g>
              <g ref={gRef}></g>
            </svg>
          </div>
        : null
      }
      
    </div>
  )
};

export default FemalePies;