import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';


import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import { makeStyles } from '@material-ui/core/styles';

import api from '../api';
import Plot from '../components/plot-historical-projections';

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

const HistoricalProjections = () => {
    const classes = useStyles();

    const [ country, setCountry ] = useState('India');
    const [ countries, setCountries ] = useState([]);

    const [ region, setRegion ] = useState();
    const [ regions, setRegions ] = useState([]);

    const [ pastData, setPastData ] = useState([]);
    const [ predictionData, setPredictionData ] = useState([]);
  
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    const [ , setSearchBarRegion ] = useState(null); 

    const [ plot, setPlot ] = useState('Active');

    const [ loaded, setLoaded ] = useState(false);

    useEffect(() => {
        const fetchGlobalData = async () => {
          try {
            // Por ahora solo son tres paises
            //const { data: { availableCountries: countries } } = await api.getCountries();
            //setCountries(countries);
            const regions = Object.values((await api.getRegions(country)).data)[0];
    
            setCountries(['India', 'US', 'Russia']);
            setRegions(regions);
            setLoaded(true);
          } catch (error) {
            console.log(error);
          }
        }
    
        fetchGlobalData();
      }, []);

    useEffect(() => {
        const fetchData = async () => {
            const regions = Object.values((await api.getRegions(country)).data)[0];
            setRegions(regions);
        }

        fetchData();
    }, [country]);

    useEffect(() => {
        const fetchData = async () => {
            const data = (await api.getData(selectedDate, region, country)).data.data;
            if(data) {
                setPastData(data.actual_data);
                setPredictionData(data.predictions);
            } else {
                console.log('Sin datos');
            }
        }

        if(!!country && !!region && !!selectedDate) {
            fetchData();
        }
    }, [country, region, selectedDate]);

    const handleChange = (event) => {
        setRegion();
        setCountry(event.target.value);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const plotHandler = (plot) => {
        setPlot(plot);
    }

    const title = () => {
        if(region) {
          return region;
        }
        return country
    }

    return <Container maxWidth="xl" component="main">
        <Grid container justify='center' style={{padding: '10px', paddingTop: '30px'}}>
            <Grid item xs={12} md={12}>
                <Paper>
                    <Typography component="h4" variant="h4" align="center" color="textPrimary">
                        Historical Projections
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
        <Grid container justify='center' style={{padding: '10px'}} >
            <Grid item xs={12} md={12}>
                <Paper>
                    <Grid item>
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
                                                setRegion(newInputValue);
                                            }
                                        }}
                                        style={{ width: 200 }}
                                        renderInput={(params) => <TextField {...params} label={['Russia'].includes(country) ? 'Region' : 'State'} variant="outlined" />}
                                    />
                                </Grid>
                                <Grid>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            inputVariant="outlined"
                                            disableToolbar
                                            variant="inline"
                                            format="yyyy-MM-dd"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </Grid>
                            </Grid>
                        </FormControl>
                    </Grid>
                    <Grid item style={{height: '550px', padding: '5px'}}>
                        {
                        plot === 'Active' &&
                        <Plot 
                            title={`${title()} Active cases Forecast (next 21 days)`}
                            type="active"
                            pastColor="blue" 
                            predictionColor="orange" 
                            pastData={pastData} 
                            predictionData={predictionData} 
                        />
                        }
                        {
                        plot === 'Confirmed' &&
                        <Plot 
                            title={`${title()} Confirmed cases Forecast (next 21 days)`}
                            type="confirmed"
                            pastColor="blue" 
                            predictionColor="orange" 
                            pastData={pastData} 
                            predictionData={predictionData} 
                        />
                        }
                        {
                        plot === 'Deceased' &&
                        <Plot 
                            title={`${title()} Deceased cases Forecast (next 21 days)`}
                            type="deaths"
                            pastColor="blue" 
                            predictionColor="orange" 
                            pastData={pastData} 
                            predictionData={predictionData} 
                        />
                        }
                    </Grid>
                    <Grid item xs={12} style={{padding: '20px', paddingTop:'40px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <ButtonGroup size="large">
                            <Button variant={plot === 'Active'  ? "contained" : "outlined"} color={plot === 'Active' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Active')}>Active</Button>
                            <Button variant={plot === 'Confirmed'  ? "contained" : "outlined"} color={plot === 'Confirmed' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Confirmed')}>Confirmed</Button>
                            <Button variant={plot === 'Deceased'  ? "contained" : "outlined"} color={plot === 'Deceased' ? "primary" : "default"} onClick={plotHandler.bind(this, 'Deceased')}>Deceased</Button>
                        </ButtonGroup>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    </Container>;
}

export default HistoricalProjections;