import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

const countries = {
    Russia: {
        map: 'russia/russia-region.json',
        width: 1000,
        height: 600,
        objectName: 'collection',
        propertyName: 'en_native_nam'
    },
    India: {
        map: 'india/india.json',
        width: 1000,
        height: 600,
        objectName: 'india',
        propertyName: 'st_nm'
    },
    US: {
        map: 'united-states/us-albers.json',
        width: 1000,
        height: 600,
        objectName: 'us',
        propertyName: 'name'
    },
  }

const Map = (props) => {
    const {
        country,
        region,
        regionHandler,
        heatFactors,
        districtHandler,
        district
    } = props;

    const mapRef = useRef();

    useEffect(() => {
        const drawMap = async () => {
            let pathFile = countries[country].map;
            let w = countries[country].width;
            let h = countries[country].height;
            let objectName = countries[country].objectName;
            let propertyName = countries[country].propertyName;

            if(country === 'India' && region) {
                const fileRegion = region.toLowerCase().replace(/ /g, '');
                pathFile = `india/states/${fileRegion}.json`;
                objectName = fileRegion;
                propertyName = 'district';
            }
            const mapJson = await d3.json(`/topojson/countries/${pathFile}`);
            const color = d3
            .scaleThreshold()
            .domain([0, 1, 5, 10, 15, 30, 50, 100])
            .range(d3.schemeOrRd[8]);

            function centerZoom(data, objectName, projection, path, width, height) {
                const o = topojson.mesh(data, data.objects[objectName], function(a, b) { return a === b; });
          
                projection
                    .scale(1)
                    .translate([0, 0]);
          
                const b = path.bounds(o),
                    s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
          
                projection
                    .scale(s)
                    .translate(t);
            }
            
             function drawStates(g, data, objectName){
                const states = g.selectAll(".state")
                    .data(topojson.feature(data, data.objects[objectName]).features)
                    .enter().append("path")
                    .attr("class", "state")
                    .attr("d", path)
                    .style("fill", function(item) {
                        const currentArea = item.properties[propertyName];
                        const chosenArea = (country === 'India' && region) ? district: region;

                        if(currentArea === chosenArea) {
                            return "gold";
                        } else if (heatFactors.hasOwnProperty(currentArea)) {
                            const percentage = heatFactors[currentArea];
                            return color(percentage);
                        } else {
                            return color(0);
                        }
                    })
                    .style("stroke", "#3a403d")
                    .style("stroke-width", "1px")
                    .attr("cursor", "pointer")
                    .on("click", function (item) {
                        const currentArea = item.properties[propertyName];
                        if(d3.select(this).style("fill") === 'gold') {
                            if(country === 'India' && region) {
                                console.log('District');
                                districtHandler(undefined);
                            } else {
                                regionHandler(undefined);
                            }
                        } else {
                            d3.select(this).attr("r", 10).style("fill", "gold");
                            if(country === 'India' && region) {
                                districtHandler(currentArea);
                            } else {
                                regionHandler(currentArea);
                            }
                        }
                    })
                    .on("mouseover", function (item) {
                        if(d3.select(this).style("fill") !== 'gold') {
                            d3.select(this).attr("r", 10).style("fill", "grey");
                        }
                    })
                    .on("mouseout", function (item) {
                        if(d3.select(this).style("fill") !== 'gold') {
                            const currentArea = item.properties[propertyName];
                            let currentColor = color(0);
                            if(heatFactors.hasOwnProperty(currentArea)) {
                                const percentage = heatFactors[currentArea];
                                currentColor = color(percentage);
                            } 
                            d3.select(this).attr("r", 10).style("fill", currentColor);
                        }
                    });
          
                return states;
            }
            
            const projection = d3
              .geoMercator()
              .rotate([-11, 0]);
            
            const path = d3.geoPath()
              .projection(projection)
              .pointRadius(2);
            
            d3.selectAll("#map").remove();
            const svg = d3.select(mapRef.current)
              .append("svg")
              .attr("id", "map")
              .attr("viewBox", [0, 0, w, h]);
    
            const g = svg.append("g");
            centerZoom(mapJson, objectName, projection, path, w, h);
            drawStates(g, mapJson, objectName);
        }

        drawMap();
    }, [country, region, district, heatFactors]);

    return <div ref={mapRef} style={{position: 'relative', width: '100%', height:'100%'}}></div>
}

export default Map;