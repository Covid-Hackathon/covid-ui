import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from "topojson-client";

const countries = {
    Russia: {
      map: 'russia/russia-region.json',
      width: 975,
      height: 610,
      objectName: 'collection',
      propertyRegion: 'en_native_nam'
    },
    India: {
        map: 'india/india-states.json',
        width: 1000,
        height: 1000,
        objectName: 'IND_adm1',
        propertyRegion: 'NAME_1'
    },
  }

const Map = (props) => {
    const {
        country,
        regionHandler,
    } = props;

    const mapRef = useRef();

    useEffect(() => {
        
        const drawMap = async () => {
            const mapJson = await d3.json(`/topojson/countries/${countries[country].map}`);

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
                    .style("fill", "#fff8ee")
                    .style("stroke", "#3a403d")
                    .style("stroke-width", "1px")
                    .attr("cursor", "pointer")
                    .on("click", function (item) {
                        if(d3.select(this).style("fill") === 'red') {
                            d3.select(this).attr("r", 5.5).style("fill", "#fff8ee");
                            regionHandler(undefined);
                        } else {
                            g.selectAll(".state").attr("r", 5.5).style("fill", "#fff8ee");
                            d3.select(this).attr("r", 10).style("fill", "red");;
                            regionHandler(item.properties[countries[country].propertyRegion]);
                        }
                    })
                    .on("mouseover", function () {
                        if(d3.select(this).style("fill") !== 'red') {
                            d3.select(this).attr("r", 10).style("fill", "gray");
                        }
                    })
                    .on("mouseout", function () {
                        if(d3.select(this).style("fill") !== 'red') {
                            d3.select(this).attr("r", 5.5).style("fill", "#fff8ee");
                        }
                        
                    });
          
                return states;
            }
            
            
            const w = countries[country].width;
            const h = countries[country].height;
            const objectName = countries[country].objectName;

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
    }, [country]);

    return <div ref={mapRef} style={{position: 'relative', width: '100%', height:'100%'}}></div>
}

export default Map;