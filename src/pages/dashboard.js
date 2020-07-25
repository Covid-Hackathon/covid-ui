import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';

import api from '../api';
import Map from '../components/map';
import CustomizedTables from '../components/table';
import Loading from '../components/loading'

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const activeChart = (place, realData, predictionData, property) => {
  function scaleYaxis(max_elem) {
    var dig = 0
    if (max_elem < 10)
        return 15
    while (max_elem > 9) {
        dig += 1
        max_elem /= 10
    }
    if (dig < 3) {

        return ((max_elem + 2) * Math.pow(10, dig))
    }
    else {
        return ((max_elem + 1) * Math.pow(10, dig))
    }
  }

  const prev_dates = realData.map(item => item.date);
  const next_dates = predictionData.map(item => item.date);
  const prev_active = realData.map(item => item[property]);
  const next_active = predictionData.map(item => item[property]);

  const p_len = prev_active.length - 1;
  next_active.unshift(prev_active[p_len]);
  let max_act = prev_active[p_len];

  for (let i = 0; i < p_len; i++) {
    next_active.unshift(null);

    if (prev_active[i] > max_act) {
        max_act = prev_active[i]
    }
  }

  for (let i = 0; i < next_dates.length; i++) {
      prev_active.push(null);

      if (next_active[i] > max_act) {
          max_act = next_active[i]
      }
  }

  const dates = [
    ...prev_dates,
    ...next_dates
  ];

  const yaxis_scale = scaleYaxis(max_act);

  const typeCase = 'active' === property ? 'Active' : 'Deceased';
  const data = {
      labels: dates,
      datasets: [{
          label: typeCase,
          fill: false,
          lineTension: 0.2,
          borderColor: 'active' === property ? "blue" : "red",
          borderCapStyle: 'square',
          borderJoinStyle: 'miter',
          pointBackgroundColor: "black",
          pointBorderWidth: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "black",
          pointHoverBorderWidth: 0,
          pointRadius: 3,
          pointHitRadius: 10,
          data: prev_active,
          spanGaps: true,
      },
      {
          label: "Forecast",
          fill: false,
          lineTension: 0.3,
          borderColor: 'active' === property ? 'orange' : 'rgb(97, 27, 45)',
          borderCapStyle: 'square',
          borderJoinStyle: 'miter',
          pointBackgroundColor: "black",
          pointBorderWidth: 0,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "black",
          pointHoverBorderWidth: 0,
          pointRadius: 3,
          pointHitRadius: 10,
          data: next_active,
          spanGaps: true,
      }]
  };

  const options = {
      title: {
          display: true,
          text: `${place} ${typeCase} cases Forecast(next 7 days)`
      },
      maintainAspectRatio: false,
      responsive: true,
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true,
                  suggestedMax: yaxis_scale,
                  maxTicksLimit: 9
              }
          }],
          xAxes: [{
              ticks: {
                  autoSkip: false
              }
          }]
      },
      legend: {
          display: true,
          position: 'bottom'
      },
      layout: {
          padding: 30
      }
  };
  
  return {
    data,
    options
  }
}



const Dashboard = () => {
  const classes = useStyles();

  const [ loaded, setLoaded ] = useState(false);

  const [ country, setCountry ] = useState('Russia');
  const [ countries, setCountries ] = useState([]);

  const [ regions, setRegions ] = useState([]);
  const [ region, setRegion ] = useState();

  const [ pastData, setPastData ] = useState([]);
  const [ predictionData, setPredictionData ] = useState([]);

  const handleChange = (event) => {
    setRegion();
    setCountry(event.target.value);
  };

  const fetchCountry = async (country, regions) => {
    const pastPromises = Promise.all(regions
      .filter(region => region !== country)
      .map(region => api.getPast(country, region))
    );

    const predictionPromises = Promise.all(regions
      .filter(region => region !== country)
      .map(region => api.getPrediction(country, region))
    );

    const [pastData, predictionData] = (await Promise.all([pastPromises, predictionPromises]))
    .map(array => array
      .map(result => Array.isArray(result.data) ? result.data : Object.values(result.data)[0])
      // Limpiando array
      .filter(result => {
        return Array.isArray(result) && result.length > 0;
      })
      // Remover repetidos
      .map(day => {
        return day.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index)
      })
      // Sumar todas las regiones de rusia
      .reduce((accumulator, currentValue) => accumulator
        .map((item, index) => {
          return {
            date: item.date,
            active: item.active + currentValue[index].active,
            confirmed: item.confirmed + currentValue[index].confirmed,
            deaths: item.deaths + currentValue[index].deaths
          }
        })
      )
    );

    setLoaded(true);
    setPastData(pastData);
    setPredictionData(predictionData);
  }

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        //const { data: { availableCountries: countries } } = await api.getCountries();
        const regions = Object.values((await api.getRegions(country)).data)[0];
        // Por ahora solo son dos
        //setCountries(countries);
        setCountries(['Russia', 'India'])
        setRegions(regions);

        await fetchCountry(country, regions);
      } catch (error) {
        console.log(error);
      }
    }

    fetchGlobalData();
  }, []);

  useEffect(() => {
    setLoaded(false);
    const fetchData = async () => {
      if (region) {
        let pastData = (await api.getPast(country, region)).data;
        pastData = Array.isArray(pastData) ? pastData : [];
        pastData = pastData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index)
        let predictionData = Object.values((await api.getPrediction(country, region)).data)[0];
        predictionData = Array.isArray(predictionData) ? predictionData : [];
        predictionData = predictionData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index);
        setPastData(pastData);
        setPredictionData(predictionData);
        setLoaded(true);
      } else if(regions.length > 0) {
        const regions = Object.values((await api.getRegions(country)).data)[0];
        setRegions(regions);
        fetchCountry(country, regions);
      }
    }

    fetchData();
  }, [country, region]);

  const regionHandler = (state) => {
    setRegion(state);
  }

  const title = () => {
    if(region) {
      return region;
    }
    return country
  }

  const lineInfected = activeChart(title(), pastData, predictionData, 'active');
  const lineDeaths = activeChart(title(), pastData, predictionData, 'deaths');

  return (
    <Grid container>
      <Grid item xs={12} md={3} style={{padding: '5px'}}>
      <Paper style={{ height: '100%' }}>
          <Loading loaded={loaded}>
            <CustomizedTables title={title()} data={pastData} />
            <CustomizedTables title={`Forecasted ${title()}`} data={predictionData} />
          </Loading>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5} style={{padding: '5px'}}>
        <Paper style={{ height: '100%' }}>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              id="country"
              labelId="country-label"
              value={country}
              onChange={handleChange}
              label="Country"
            >
              {
                countries.map((item => {
                  return <MenuItem key={item} value={item}>{item}</MenuItem>
                }))
              }
            </Select>
          </FormControl>
          <Typography variant="h3" align="center" style={{paddingTop: '25px', paddingBottom: '25px'}}>
            {title()}
          </Typography>
          <Map 
            country={country}
            regionHandler={regionHandler} 
          />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4} style={{padding: '5px'}}>
        <Paper style={{ height: '100%' }}>
          <Loading loaded={loaded}>
            <Grid item xs={12} style={{height: '450px'}}>
              <Line data={lineInfected.data} options={lineInfected.options} />
            </Grid>
            <Grid item xs={12} style={{height: '450px'}}>
              <Line data={lineDeaths.data} options={lineDeaths.options}/>
            </Grid>
          </Loading>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard;