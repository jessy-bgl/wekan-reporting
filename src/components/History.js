import React, { Component } from "react";
import { Link } from "react-router-dom";
import { MongoClient } from "mongodb";
import { withStyles } from "@material-ui/core/styles";
import assert from "assert";
import {
  MONGO_URL,
  ID_LIST_COMMANDE_A_EXPEDIER,
  ID_LIST_COMMANDE_A_PREPARER,
  ID_LIST_SAV_A_TRAITER,
  ID_LIST_SAV_A_RETOURNER
} from "../constants";

import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import LinearProgress from "@material-ui/core/LinearProgress";
import NavigateBefore from "@material-ui/icons/NavigateBefore";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  Line,
  Brush
} from "recharts";

import getHistory from "../getters/history";

const styles = theme => ({
  margin: { margin: theme.spacing(1) },
  progress: { margin: theme.spacing(2) }
});

class History extends Component {
  constructor(props) {
    super(props);
    this.state = { dtp_prepa_com: null, dtp_sav: null };
  }

  async componentDidMount() {
    MongoClient.connect(
      MONGO_URL,
      { useNewUrlParser: true },
      async (err, client) => {
        assert.equal(null, err);
        const dtp_prepa_com = await getHistory(
          client,
          ID_LIST_COMMANDE_A_PREPARER,
          ID_LIST_COMMANDE_A_EXPEDIER
        );
        this.setState({ dtp_prepa_com });
        const dtp_sav = await getHistory(
          client,
          ID_LIST_SAV_A_TRAITER,
          ID_LIST_SAV_A_RETOURNER
        );
        this.setState({ dtp_sav });
      }
    );
  }

  renderChart(data_type) {
    return (
      <ResponsiveContainer width="99%" height={300}>
        <ComposedChart width={750} height={250} data={data_type}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Brush />
          <CartesianGrid stroke="#f5f5f5" />
          <Area type="monotone" dataKey="sorties mensuelles" />
          <Area
            type="monotone"
            dataKey="entrées mensuelles"
            fill="#8884d8"
            stroke="#8884d8"
          />
          <Line
            type="monotone"
            dataKey="entrées"
            stroke="#C9DE00"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sorties"
            stroke="#ff7300"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  render() {
    const { classes } = this.props;
    const { dtp_prepa_com, dtp_sav } = this.state;

    return (
      <Grid container direction="column" justify="center" alignItems="center">
        <Grid item>
          <Typography variant="h5">Préparation commande</Typography>
        </Grid>
        <Grid item style={{ width: "100%" }}>
          {!dtp_prepa_com ? (
            <LinearProgress className={classes.progress} />
          ) : (
            this.renderChart(dtp_prepa_com)
          )}
        </Grid>

        <Grid item style={{ marginTop: 20 }}>
          <Typography variant="h5">SAV</Typography>
        </Grid>
        <Grid item style={{ width: "100%" }}>
          {!dtp_sav ? (
            <LinearProgress className={classes.progress} />
          ) : (
            this.renderChart(dtp_sav)
          )}
        </Grid>

        <Grid item style={{ marginTop: 20 }}>
          <Button
            variant="contained"
            color="inherit"
            to="/"
            component={Link}
            className={classes.margin}
          >
            <NavigateBefore />
            Retour
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(History);
