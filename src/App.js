import React from 'react';
import Dashboard from './pages/dashboard';
import AboutTheModel from './pages/about-the-model';
import MedicalInventory from './pages/medical-inventory';
import MeetTheTeam from './pages/meet-the-team';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
//import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";
import HistoricalProjections from './pages/historical-projections';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  link: {
    color: 'white',
    fontWeight: 'bold',
    margin: theme.spacing(1, 1.5),
    textDecoration: 'none',
    '&:hover': {
      color: "goldenrod",
    },
  },
}));

const App = () => {
  const classes = useStyles();

  return (
    <>
          <Router>
      <CssBaseline />
      <AppBar position="static" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            RECOVER
          </Typography>
          <nav>
            <Link to="/dashboard" className={classes.link}>
              Dashboard
            </Link>
            <Link to="/about-the-model" className={classes.link}>
              About the Model
            </Link>
            <Link to="/historical-projections" className={classes.link}>
              Historical Projections
            </Link> 
            <Link to="/medical-inventory" className={classes.link}>
              Medical Inventory
            </Link>
            <Link to="/meet-the-team" className={classes.link}>
              Meet the team
            </Link>
            
          </nav>
        </Toolbar>
      </AppBar>

        <Switch>
          <Route path='/dashboard' exact>
            <Dashboard />
          </Route>
          <Route path='/about-the-model' exact>
            <AboutTheModel />
          </Route>
          <Route path='/historical-projections' exact>
            <HistoricalProjections />
          </Route>
          <Route path='/medical-inventory' exact>
            <MedicalInventory />
          </Route>
          <Route path='/meet-the-team' exact>
            <MeetTheTeam />
          </Route>
          <Redirect path='/' to='/dashboard' />
        </Switch>
      </Router>
    </>
  );
}

export default App;
