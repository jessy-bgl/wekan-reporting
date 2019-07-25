import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
  titleSAV: { textAlign: "center", backgroundColor: "lightblue" },
  titlePrepaCom: { textAlign: "center", backgroundColor: "coral" }
});

class Title extends Component {
  render() {
    const { title, classes } = this.props;

    return (
      <Typography
        variant="h5"
        className={
          title.toLowerCase().includes("sav")
            ? classes.titleSAV
            : classes.titlePrepaCom
        }
      >
        {title}
      </Typography>
    );
  }
}

export default withStyles(styles)(Title);
