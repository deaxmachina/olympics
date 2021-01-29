import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./FemalePies.css";
import _ from "lodash";
import chroma from "chroma-js";
import rough from 'roughjs/bundled/rough.cjs';



const Pie = ({ show, setShow }) => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const revealButtonRef = useRef();

  /// constatns ///
  // dimensions 
  const height = 400;
  const width = height;
  // for the pies 
  const pieSize = 400; 
  const innerRadius = 60;
  const outerRadius = pieSize/2 - 10;
  const padAngle = 0.1;
  const conerRadius = 15;
  // colours 
  const colourFemale = chroma("#ff006e").saturate(0)
  const colourMale = chroma("#219ebc").saturate(2)



  /// D3 Code ///
  useEffect(() => {

      /////////////////////////////////////////////
      /////////// Rough JS Define /////////////////
      /////////////////////////////////////////////
      let rc = rough.svg(document.getElementById("svg-pie"));

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
        .attr("transform", `translate(${width/2}, ${height/2})`)

      const data = 
      [
        {gender: "male", percentage: 50, year: 0},
        {gender: "female", percentage: 50, year: 0},
      ]

      // draw the pie chart
      const pieCharts = g
        .each(function(d, i) {
          d3.select(this).node()
          // draw part for the male 
            .appendChild(
              rc.path(arc(pie(data)[0]), {
                stroke: colourMale,
                strokeWidth: 1,
                fillStyle: 'cross-hatch',
                fill: colourMale,
                roughness: 2.5,
          }))
          // draw part for the female 
            .appendChild(
              rc.path(arc(pie(data)[1]), {
                stroke: colourFemale,
                strokeWidth: 0.8,
                fillStyle: 'zigzag',
                fill: colourFemale,
                roughness: 2.2,
          }))
        });

      // draw the pie chart again for thicker lines
      const pieCharts2 = g
        .each(function(d, i) {
          d3.select(this).node()
          // draw part for the male 
            .appendChild(
              rc.path(arc(pie(data)[0]), {
                stroke: colourMale,
                strokeWidth: 1,
                fillStyle: 'cross-hatch',
                fill: colourMale,
                roughness: 2.5,
          }))
          // draw part for the female 
            .appendChild(
              rc.path(arc(pie(data)[1]), {
                stroke: colourFemale,
                strokeWidth: 0.8,
                fillStyle: 'zigzag',
                fill: colourFemale,
                roughness: 2.2,
          }))
        });

      ////////////////////////////
      ///////// Button //////////
      //////////////////////////
      const revealButton = d3.select(revealButtonRef.current)
        .attr("transform", `translate(${width/2}, ${height/2})`)

      const revealButtonCircle = revealButton.selectAll(".button-circle").data([0]).join("circle")
        .classed("button-circle", true)
          .attr("r", 40)
          .attr("fill", "white")
          .attr("stroke", "#AB2E64")
          .attr("stroke-width", 5)

      const revealButtonText = revealButton.selectAll(".button-text").data(["show"]).join("text")
        .classed("button-text", true)
          .text(d => d)
          .attr("fill", "#AB2E64")
          .attr("dy", "0.35em")
          .style("text-anchor", "middle")
          .attr("font-size", "20px")
          .attr("cursor", "default")

      revealButton.on("click", function(){setShow(true)})


  }, [show]);

  return (
      <div className="wrapper">
        <svg ref={svgRef} width={width} height={height} id="svg-pie">
          <g ref={gRef}></g>
          <g ref={revealButtonRef}></g>
        </svg>
      </div>
  )
};

export default Pie;