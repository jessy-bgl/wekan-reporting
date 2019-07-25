import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Bar,
  Line
} from "recharts";

const styles = theme => ({ margin: { margin: theme.spacing() } });

class History extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  render() {
    const { classes } = this.props;

    return (
      <Grid container>
        <Button
          variant="contained"
          to="/"
          component={Link}
          className={classes.margin}
        >
          Retour
        </Button>
      </Grid>
    );
  }
}

export default withStyles(styles)(History);
