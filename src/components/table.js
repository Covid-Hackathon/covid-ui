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
              <StyledTableCell align="center">Confirmed</StyledTableCell>
              <StyledTableCell align="center">Active</StyledTableCell>
              <StyledTableCell align="center">Deceased</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data && props.data.map((datum) => {
                const row = createData(datum);

                return (
                    <StyledTableRow key={row.date}>
                        <StyledTableCell align="center" component="th" scope="row">{row.date}</StyledTableCell>
                        <StyledTableCell align="center" component="th" scope="row">{row.confirmed}</StyledTableCell>
                        <StyledTableCell align="center" component="th" scope="row">{row.active}</StyledTableCell>
                        <StyledTableCell align="center" component="th" scope="row">{row.deceased}</StyledTableCell>
                    </StyledTableRow>
                );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default CustomizedTables; 