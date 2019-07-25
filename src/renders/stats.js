import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ArrowRightAlt from "@material-ui/icons/ArrowRightAlt";

const styles = theme => ({ padding: { padding: theme.spacing(1) } });

const angle = diff => {
  if (diff === 0) return 0;
  else if (diff < 0) return -45;
  else return 45;
};

class Stats extends Component {
  render() {
    const { stats, classes } = this.props;

    return (
      <Paper>
        <Grid container justify="space-between">
          <Grid item>
            <Grid container spacing={2} className={classes.padding}>
              <Grid item>
                <Typography variant="h6">
                  Arrivées J-7 : {stats.j7.created}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  Sorties J-7 : {stats.j7.archived}
                </Typography>
              </Grid>
              <Grid item>
                <ArrowRightAlt
                  style={{
                    transform: `rotate(${angle(
                      stats.j7.archived - stats.j7.created
                    )}deg)`,
                    fontSize: 30
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container spacing={2} className={classes.padding}>
              <Grid item>
                <Typography variant="h6">
                  Arrivées J-30 : {stats.j30.created}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  Sorties J-30 : {stats.j30.archived}
                </Typography>
              </Grid>
              <Grid item>
                <ArrowRightAlt
                  style={{
                    transform: `rotate(${angle(
                      stats.j30.archived - stats.j30.created
                    )}deg)`,
                    fontSize: 30
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Stats);
