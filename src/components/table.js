import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);
  
  function createData(datum) {
        const date = datum['date'];
        const active = datum['active'];
        const deceased = datum['deaths'];
        const confirmed = datum['confirmed'];

        return { date, active, deceased, confirmed };
  }
  const useStyles = makeStyles({
    table: {
      width: '100%',
    },
  });
  
const CustomizedTables = (props) => {
    const classes = useStyles();
    const confirmedOn = props.data.reduce((accumulator, currentValue) => {
      return accumulator || ((currentValue.hasOwnProperty('confirmed') && !isNaN(currentValue.confirmed)));
    }, false);
    const activeOn = props.data.reduce((accumulator, currentValue) => {
      return accumulator || ((currentValue.hasOwnProperty('active') && !isNaN(currentValue.active)));
    }, false);
    const deceasedOn = props.data.reduce((accumulator, currentValue) => {
      return accumulator || ((currentValue.hasOwnProperty('deaths') && !isNaN(currentValue.deaths)));
    }, false);
  
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            {props.title && 
                <TableRow> 
                    <StyledTableCell colSpan={4} align="center">{props.title}</StyledTableCell>
                </TableRow>
            }
            <TableRow>
              <StyledTableCell align="center">Date</StyledTableCell>
              { confirmedOn && <StyledTableCell align="center">Confirmed</StyledTableCell> }
              { activeOn && <StyledTableCell align="center">Active</StyledTableCell> }
              { deceasedOn && <StyledTableCell align="center">Deceased</StyledTableCell> }
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data && props.data.map((datum) => {
                const row = createData(datum);

                return (
                    <StyledTableRow key={row.date}>
                        <StyledTableCell align="center" component="th" scope="row">{row.date}</StyledTableCell>
                        { confirmedOn && <StyledTableCell align="center" component="th" scope="row">{row.confirmed}</StyledTableCell> }
                        { activeOn && <StyledTableCell align="center" component="th" scope="row">{row.active}</StyledTableCell> }
                        { deceasedOn && <StyledTableCell align="center" component="th" scope="row">{row.deceased}</StyledTableCell> }
                    </StyledTableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default CustomizedTables; 