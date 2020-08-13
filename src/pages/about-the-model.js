import React from 'react';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const AboutTheModel = () => {
    return <>
    <Container maxWidth="xl" component="main">
        <Grid container justify='center' style={{padding: '30px'}}>
          <Grid item xs={12} md={5} style={{padding: '30px'}}>
            <Paper style={{padding: '50px'}}>
                <Typography component="h4" variant="h4" align="center" color="textPrimary">
                    Abstract
                </Typography>
                <Typography component="p" variant="p" align="justify" color="textPrimary" style={{paddingTop: '15px', fontSize: '1.4em'}}>
                    A spread of a disease caused by a virus can happen through human to human contact or could be from the environment. A mathematical model could be used to capture the dynamics of the disease spread to estimate the infections, recoveries, and deaths that may result from the disease. An estimation is crucial to make policy decisions and for the alerts for the medical emergencies that may arise. Many epidemiological models are being used to make such an estimation. One major factor that is important in the predictions using the models is the dynamic nature of the disease spread. Unless we can come up with a way of estimating the parameters that guide this dynamic spread, the models may not give accurate predictions. Our time-dependent SEIRD model forecasts COVID-19 cases three weeks ahead.
                </Typography>
                <Typography component="p" variant="p" align="justify" color="textPrimary" style={{paddingTop: '15px',  fontSize: '1em'}}>
                    <Link href="https://doi.org/10.1101/2020.05.29.20113571">A Time-Dependent SEIRD Model for Forecasting the COVID-19 Transmission Dynamics.</Link><br />
                    Taarak Rapolu, Brahmani Nutakki, T. Sobha Rani, S. Durga Bhavani 
                </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5} style={{padding: '30px'}}>
            <Paper style={{padding: '50px'}}>
                <Typography component="h4" variant="h4" align="center" color="textPrimary">
                    Assumptions
                </Typography>
                <Typography component="p" variant="p" align="justify" color="textPrimary" style={{paddingTop: '15px', fontSize: '1.4em'}}>
                    <ol>
                        <li>The effect due to environmental factors is considered to be negligible.</li>
                        <li>The percentage of the population recovered, being infected again is considered negligible.</li>
                        <li>The growth of testing capabilities is the same as that of the previous week.</li>
                        <li>The current interventions will not change for the forecasting period.</li>
                        <li>The Susceptible to Total Population ratio ( S / N ) is always considered to be less than one, even when there is a change in population due to vital dynamics or migration of people.</li>
                    </ol>        
                </Typography>
                <Typography component="h4" variant="h4" align="center" color="textPrimary" style={{paddingTop: '15px'}}>
                    Data Sources:
                </Typography>
                <Grid container justify='center'>
                    <Grid xs={7}>
                        <Typography component="p" variant="p" align="justify" color="textPrimary" style={{paddingTop: '15px', fontSize: '1.4em'}}>
                        <ul>
                            <li>India: <Link href="https://api.covid19india.org/">COVID-19 India Tracker</Link></li>
                            <li>Russia: <Link href="http://covid19.bvn13.com/stats/all">COVID-19 Statistics in Russia</Link></li>
                            <li>US: <Link href="https://covidtracking.com/data/api">The COVID Tracking Project</Link></li>
                        </ul>
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
          </Grid>
        </Grid>
       </Container>
    </>;
}

export default AboutTheModel;