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
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Modal from '@material-ui/core/Modal';
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
  paper: {
    position: 'absolute',
    width: '80%',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const activeChart = (place, realData, predictionData, property, name, colorPast, colorForecast) => {
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

  const data = {
      labels: dates,
      datasets: [{
          label: name,
          fill: false,
          lineTension: 0.2,
          borderColor: colorPast,
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
          borderColor: colorForecast,
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
          text: `${place} ${name} cases Forecast(next 21 days)`
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

  const [ plot, setPlot ] = useState('Active');
  const [ open, setOpen ] = useState(false);

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

        setCountries(['India', 'US', 'Russia']);
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

    if(country === 'US' && plot === 'Active') {
      setPlot('Confirmed');
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

  const plotHandler = (plot) => {
    setPlot(plot);
  }

  const handleOpen = (state) => {
    setOpen(state);
  };

  const title = () => {
    if(district) {
      return district;
    } else if(region) {
      return region;
    }
    return country
  }

  const lineActive = activeChart(title(), pastData, predictionData, 'active', 'Active', 'blue', 'orange');
  const lineConfirmed = activeChart(title(), pastData, predictionData, 'confirmed', 'Confirmed', 'red', 'darkgoldenrod');
  const lineDeaths = activeChart(title(), pastData, predictionData, 'deaths', 'Deceased', 'gray', 'saddlebrown');

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
        <Grid container style={{ height: '100%' }}>
          <Grid item xs={12} md={6}>
            <Grid item xs={12} style={{padding: '5px'}}>
                <Paper>
                  <Typography variant="h4" align="center" style={{paddingTop: '10px', paddingBottom: '5px'}}>
                      {title()}
                  </Typography>
                </Paper>
            </Grid>
            <Grid item xs={12} style={{height: '100%', padding: '5px'}}>
              <Paper style={{height: '100%'}}>
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
          <Grid item xs={12} md={6}>
            <Grid item xs={12} style={{padding: '5px'}}>
              <Paper>
                <Typography variant="h4" align="center" style={{paddingTop: '10px', paddingBottom: '5px'}}>
                  { plot }
                </Typography>
              </Paper>
            </Grid>
            <Loading loaded={loaded}>
              <Grid item xs={12} style={{height: '100%', padding: '5px'}}>
                <Paper style={{height: '100%'}}>
                  <Grid style={{height: '400px', padding: '5px'}} xs={12}>
                    {
                      plot === 'Active' &&
                      <Line data={lineActive.data} options={lineActive.options} />
                    }
                    {
                      plot === 'Confirmed' &&
                      <Line data={lineConfirmed.data} options={lineConfirmed.options} />
                    }
                    {
                      plot === 'Deceased' &&
                      <Line data={lineDeaths.data} options={lineDeaths.options}/>
                    }
                  </Grid>
                  <Grid xs={12} style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <ButtonGroup size="large">
                        {
                          country !== 'US' && <Button variant={plot === 'Active'  ? "contained" : "outlined"} color={plot === 'Active' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Active')}>Active</Button>
                        }
                        <Button variant={plot === 'Confirmed'  ? "contained" : "outlined"} color={plot === 'Confirmed' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Confirmed')}>Confirmed</Button>
                        <Button variant={plot === 'Deceased'  ? "contained" : "outlined"} color={plot === 'Deceased' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Deceased')}>Deceased</Button>
                      </ButtonGroup>
                  </Grid>
                  <Grid xs={12} style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Button size="large" variant={"outlined"} color={"primary"} onClick={handleOpen.bind(this, true)}>
                        See the Complete Forecast!
                    </Button>
                    <Modal
                      open={open}
                      onClose={handleOpen.bind(this, false)}
                    >
                      <Grid style={{top: `50%`, left: `50%`, transform: `translate(-50%, -50%)`}} className={classes.paper}>
                        <Grid container>
                          <Grid xs={4} md={4}>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <Paper>
                                <Typography component="h1" variant="h5" align="center" color="textPrimary">
                                  Week 1 
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <TableDays showActive={country !== 'US'} data={predictionData.filter(datum => datum.week === 1)} />
                            </Grid>
                          </Grid>
                          <Grid xs={4} md={4}>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <Paper>
                                <Typography component="h1" variant="h5" align="center" color="textPrimary">
                                  Week 2
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <TableDays showActive={country !== 'US'} data={predictionData.filter(datum => datum.week === 2)} />
                            </Grid>
                          </Grid>
                          <Grid xs={4} md={4}>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <Paper>
                                <Typography component="h1" variant="h5" align="center" color="textPrimary">
                                  Week 3 
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid xs={12} style={{padding: '5px'}}>
                              <TableDays showActive={country !== 'US'} data={predictionData.filter(datum => datum.week === 3)} />
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Modal>
                  </Grid>
                </Paper>
              </Grid>
            </Loading>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Dashboard;