import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import api from '../api';
import Map from '../components/map';
import TableDays from '../components/table-days';
import TableWeeks from '../components/table-weeks';
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

  const [ country, setCountry ] = useState('India');
  const [ countries, setCountries ] = useState([]);

  const [ regions, setRegions ] = useState([]);
  const [ region, setRegion ] = useState();

  const [ districts, setDistricts ] = useState([]);
  const [ district, setDistrict ] = useState();

  const [ pastData, setPastData ] = useState([]);
  const [ predictionData, setPredictionData ] = useState([]);

  const [ , setSearchBarRegion ] = useState(null); 
  const [ , setSearchBarDistrict] = useState(null); 
  const [ heatFactorData, setHeatFactorData ] = useState({});

  const handleChange = (event) => {
    setDistrict();
    setRegion();
    setCountry(event.target.value);
  };


  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        // Por ahora solo son tres paises
        //const { data: { availableCountries: countries } } = await api.getCountries();
        //setCountries(countries);
        const regions = Object.values((await api.getRegions(country)).data)[0];

        let pastData = (await api.getPastCountry(country)).data;
        pastData = Array.isArray(pastData) ? pastData : [];
        pastData = pastData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index);

        let predictionData = Object.values((await api.getPredictionCountry(country)).data)[0];
        if(Array.isArray(predictionData) && predictionData.length > 0) {
          predictionData = predictionData
          .reduce((accumulator, currentValue) => {
            const week = +Object.keys(currentValue)[0].split('-')[1];
            const days = Object.values(Object.values(currentValue)[0])[0].map(day => {
              return {
                ...day,
                week
              }
            });
            return [...accumulator, ...days];
          }, []);   
        } else {
          predictionData = [];
        }

        setCountries(['Russia', 'India', 'US']);
        setRegions(regions);
        setPastData(pastData);
        setPredictionData(predictionData);
        setLoaded(true);
      } catch (error) {
        console.log(error);
      }
    }

    fetchGlobalData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let result = await api.getHeatFactorsCountry(country);
      const heatFactor = result.data.hasOwnProperty('heatFactors') ? result.data.heatFactors : result.data;
      setHeatFactorData(heatFactor);
    }

    fetchData();
  }, [country]);

  useEffect(() => {
    const fetchData = async () => {
      // Caso particular India
      if(country === 'India') {
        let result;
        if(region) {
          result = await api.getHeatFactorsRegion(country, region);
        } else {
          result = await api.getHeatFactorsCountry(country);
        }
        const heatFactor = result.data.hasOwnProperty('heatFactors') ? result.data.heatFactors : result.data;
        setHeatFactorData(heatFactor);
      }
    }

    fetchData();
  }, [region]);

  useEffect(() => {
    setLoaded(false);
    const fetchData = async () => {
      if(district) {
        let pastData = (await api.getPastDistrict(country, region, district)).data;
        pastData = Array.isArray(pastData) ? pastData : [];
        pastData = pastData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index);

        let predictionData = Object.values((await api.getPredictionDistrict(country, region, district)).data)[0];
        if(Array.isArray(predictionData) && predictionData.length > 0) {
          predictionData = predictionData
          .reduce((accumulator, currentValue) => {
            const week = +Object.keys(currentValue)[0].split('-')[1];
            const days = Object.values(Object.values(currentValue)[0])[0].map(day => {
              return {
                ...day,
                week
              }
            });
            return [...accumulator, ...days];
          }, []);   
        } else {
          predictionData = [];
        }

        setPastData(pastData);
        setPredictionData(predictionData);
        setLoaded(true);
      } else if (region) {
        let pastData = (await api.getPastRegion(country, region)).data;
        pastData = Array.isArray(pastData) ? pastData : [];
        pastData = pastData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index);

        let predictionData = Object.values((await api.getPredictionRegion(country, region)).data)[0];
        if(Array.isArray(predictionData) && predictionData.length > 0) {
          predictionData = predictionData
          .reduce((accumulator, currentValue) => {
            const week = +Object.keys(currentValue)[0].split('-')[1];
            const days = Object.values(Object.values(currentValue)[0])[0].map(day => {
              return {
                ...day,
                week
              }
            });
            return [...accumulator, ...days];
          }, []);   
        } else {
          predictionData = [];
        }

        setDistricts((await api.getDistricts(country, region)).data);
        setPastData(pastData);
        setPredictionData(predictionData);
        setLoaded(true);
      } else if(regions.length > 0) {
        const regions = Object.values((await api.getRegions(country)).data)[0];

        let pastData = (await api.getPastCountry(country)).data;
        pastData = Array.isArray(pastData) ? pastData : [];
        pastData = pastData.filter((value, index, self) => self.map(item => item.date).indexOf(value.date) === index);

        let predictionData = Object.values((await api.getPredictionCountry(country)).data)[0];
        if(Array.isArray(predictionData) && predictionData.length > 0) {
          predictionData = predictionData
          .reduce((accumulator, currentValue) => {
            const week = +Object.keys(currentValue)[0].split('-')[1];
            const days = Object.values(Object.values(currentValue)[0])[0].map(day => {
              return {
                ...day,
                week
              }
            });
            return [...accumulator, ...days];
          }, []);   
        } else {
          predictionData = [];
        }

        setPastData(pastData);
        setPredictionData(predictionData);
        setDistricts([]);
        setRegions(regions);
        setLoaded(true);
        //fetchCountry(country, regions);
      }
    }

    fetchData();
  }, [country, region, district]);

  const regionHandler = (region) => {
    setDistrict();
    setRegion(region);
  }


  const districtHandler = (district) => {
    setDistrict(district);
  }

  const title = () => {
    if(district) {
      return district;
    } else if(region) {
      return region;
    }
    return country
  }

  const lineInfected = activeChart(title(), pastData, predictionData, 'active');
  const lineDeaths = activeChart(title(), pastData, predictionData, 'deaths');

  return (
    <>
      <Container maxWidth="xl" component="main">
        <Grid container>
          <Grid xs={12} style={{padding: '5px'}}>
            <Paper>
              <Typography component="h1" variant="h4" align="center" color="textPrimary">
                Forecasting the COVID-19 Transmission Dynamics 
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Container maxWidth="xl" component="main">
        <Grid container>
          <Grid item xs={12} md={3}>
            <Grid xs={12} style={{padding: '5px'}}>
              <Paper>
                <Typography component="h1" variant="h5" align="center" color="textPrimary">
                  The Last 7 Days 
                </Typography>
              </Paper>
            </Grid>
            <Loading loaded={loaded}>
              <Grid xs={12} style={{padding: '5px'}}>
                <TableDays showActive={country !== 'US'} data={pastData} />
              </Grid>
            </Loading>
          </Grid>
          <Grid item xs={12} md={5}>
            <Grid xs={12} style={{padding: '5px'}}>
                <Paper>
                  <Typography variant="h4" align="center" style={{paddingTop: '10px', paddingBottom: '5px'}}>
                      {title()}
                  </Typography>
                </Paper>
            </Grid>
            <Grid xs={12} style={{padding: '5px'}}>
              <Paper style={{ height: '100%' }}>
                <FormControl variant="outlined" className={classes.formControl}>
                  <Grid container>
                    <Grid>
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
                    </Grid>
                    <Grid>
                      <Autocomplete
                        options={regions}
                        getOptionLabel={(option) => option}
                        onInputChange={(event, newInputValue) => {
                          setSearchBarRegion(newInputValue);
                          if(regions.includes(newInputValue)) {
                            setDistrict();
                            setRegion(newInputValue);
                          }
                        }}
                        style={{ width: 200 }}
                        renderInput={(params) => <TextField {...params} label={['Russia'].includes(country) ? 'Region' : 'State'} variant="outlined" />}
                      />
                    </Grid>
                    { country === 'India' && districts.length > 0 && 
                    <Grid>
                      <Autocomplete
                            options={districts}
                            getOptionLabel={(option) => option}
                            onInputChange={(event, newInputValue) => {
                              setSearchBarDistrict(newInputValue);
                              if(districts.includes(newInputValue)) {
                                setDistrict(newInputValue);
                              }
                            }}
                            style={{ width: 200 }}
                            renderInput={(params) => <TextField {...params} label={'District'} variant="outlined" />}
                        />
                    </Grid>
                    }
                    { (country === 'India' && region) &&
                      <Grid>
                        <Button onClick={regionHandler.bind(this, undefined)} style={{ height: 56 }} variant="outlined">Back</Button>
                      </Grid>
                    }
                  </Grid>
                </FormControl>
                <Map 
                  heatFactors={heatFactorData}
                  country={country}
                  region={region}
                  regionHandler={regionHandler} 
                  district={district}
                  districtHandler={districtHandler}
                />
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid xs={12} style={{padding: '5px'}}>
              <Paper>
                <Typography component="h1" variant="h5" align="center" color="textPrimary">
                  The Next 3 Weeks
                </Typography>
              </Paper>
            </Grid>
            <Loading loaded={loaded}>
              <Grid xs={12} style={{padding: '5px'}}>
                <TableWeeks showActive={country !== 'US'} data={predictionData} />
              </Grid>
            </Loading>
          </Grid>
        </Grid>
      </Container>
      <Container maxWidth="xl" component="main">
        <Grid container>
            <Loading loaded={loaded}>
              {
                (country !== 'US') &&
                <Grid item xs={12} md={6} style={{height: '450px', padding: '5px'}}>
                  <Paper style={{ height: '100%' }}>
                      <Line data={lineInfected.data} options={lineInfected.options} />
                  </Paper>
                </Grid>
              }
              <Grid item xs={12} md={country !== 'US' ? 6 : 12} style={{height: '450px', padding: '5px'}}>
                <Paper style={{ height: '100%' }}>
                  <Line data={lineDeaths.data} options={lineDeaths.options}/>
                </Paper>
              </Grid>
            </Loading>
          </Grid>
      </Container>
    </>
  );
}

export default Dashboard;