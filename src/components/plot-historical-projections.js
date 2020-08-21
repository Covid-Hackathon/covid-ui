import React from 'react';
import Plot from 'react-plotly.js';

const CustomizedPlot = (props) => {
    const {
        title,
        pastColor,
        predictionColor,
        pastData,
        predictionData,
        type
    } = props;

    const pastX = pastData.map((datum) => {
        return datum.date;
    });
    const pastY = pastData.map((datum) => {
        return datum[type];
    });
    const predictionX = predictionData.map((datum) => {
        return datum.date;
    });
    const predictionY = predictionData.map((datum) => {
        return datum[type]
    });

    return <Plot
        data={[
            {
                x: pastX,
                y: pastY,
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: pastColor},
                name: "Past to Actual",
                showlegend: true
            },
            {
                x: predictionX,
                y: predictionY,
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: predictionColor},
                name: "Predicted to Forecasted",
                showlegend: true
            },
        ]}
        layout={{
            title: title,
            autosize: true,
        }}
        useResizeHandler={true}
        style={{width: "100%", height: "100%"}}
    />
}

export default CustomizedPlot;