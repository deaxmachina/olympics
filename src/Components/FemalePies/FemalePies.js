import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./FemalePies.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';
import dataLoad from "../../data/female_summer_olympics.csv";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen } from '@fortawesome/free-solid-svg-icons'

const GraphExplain = () => {
  return (
    <div className="graph-explain-container">
      <p>Data source: <a href="https://stillmed.olympic.org/media/Document%20Library/OlympicOrg/Factsheets-Reference-Documents/Women-in-the-Olympic-Movement/Factsheet-Women-in-the-Olympic-Movement.pdf" target="_blank">IOC</a></p>
      <p className="disclaimer">*Female and male participation in the Summer Olympics; numbers are approximate</p>
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

  /// constatns ///
  // dimensions 
  const height = 600 + 70;
  const width = 1170;
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
      // this is how you could use rough js directly with the arc paths generated 
      // below; but this way you won't be able to translate them 
      // to the correct postions
      //svg.appendChild(rc.path(arc(arcs[0]), { fill: "blue" }));
      //svg.appendChild(rc.path(arc(arcs[1]), { fill: "red" }));

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
      //const arcs = pie(data);

      // 2. Arc
      // this is what you use when drawing the graph
      // it becomes the d attribute of paths
      const arc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .padAngle(padAngle)
        .cornerRadius(conerRadius);

      /// Graph ///

      // Legend on top 
      const gLegend = d3.select(legendRef.current)
        .selectAll(".legend-g-48")
        .data(['female', 'male'])
        .join("g")
        .classed("legend-g-48", true)
          .attr("transform", (d, i) => `translate(${i*150 + 50}, ${0})`)

      const legendRects = gLegend
       .append("rect")
        .attr("width", 70)
        .attr("height", 25)
        .attr("fill", (d, i) => d == "female" ? colourFemale : colourMale)
        .attr("rx", 10)
        .attr("ry", 10)

      const legendText = gLegend
        .append("text")
          .text(d => d)
          .attr("font-size", "14px")
          .attr("dy", "0.35em")
          .attr("y", 12)
          .attr("x", 10)
          .attr("text-anchor", 'start')
          .attr("font-family", 'sans-serif')
          .style("fill", "white")



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
        .attr("class", "pie-text-48")
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
  }, [dataAll]);

  const toggleGraphExplanation = () => {
    setRevealGraphExplanation(!revealGraphExplanation)
  }

  return (
    <div className="page-container page-container-female-pies">
      <h2 className="graph-title-female-pies">What is the gender split at the Olympics?</h2>
      <button 
        className="graph-explain-icon" 
        onClick={toggleGraphExplanation}
      >
        <FontAwesomeIcon icon={faBookOpen}/>
        <span className="info-span">info</span>
      </button>  
      {
        revealGraphExplanation 
        ? <GraphExplain />
        : null
      } 

      <div className="wrapper wrapper-female-pies">
        <svg id="svg-female-pies" ref={svgRef} width={width} height={height}>
          <g ref={legendRef}></g>
          <g ref={gRef}></g>
        </svg>
      </div>

    </div>
  )
};

export default FemalePies;