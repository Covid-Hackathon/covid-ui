import React from 'react';
import Dashboard from './pages/dashboard';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

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
  },
}));

const App = () => {
  const classes = useStyles();

  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={0} className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
            RECOVER
          </Typography>
          <nav>
            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
              Dashboard
            </Link>
            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
              About the Model
            </Link>
            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
              Medical Inventory
            </Link>
            <Link variant="button" color="textPrimary" href="#" className={classes.link}>
              Meet the team
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Router>
        <Switch>
          <Dashboard />
        </Switch>
      </Router>
    </>
  );
}

export default App;
