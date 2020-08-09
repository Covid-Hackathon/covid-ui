import React from 'react';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading = (props) => {
    const {
        loaded = false,
        children
    } = props;
    if(loaded) {
        return children;
    }
    
    return <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                style={{ padding: '50px' }} >
            <CircularProgress />
    </Grid>;
}

export default Loading; 