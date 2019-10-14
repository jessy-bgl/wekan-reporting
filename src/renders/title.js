import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
  titlePrepaCom: { textAlign: "center", backgroundColor: "coral" },
  titleSAV: { textAlign: "center", backgroundColor: "lightblue" },
  titlePrets: { textAlign: "center", backgroundColor: "lightgreen" }
});

const renderTitle = title => {
  if (title.toLowerCase().includes("sav")) return "titleSAV";
  else if (title.toLowerCase().includes("commande")) return "titlePrepaCom";
  else return "titlePrets";
};

class Title extends Component {
  render() {
    const { title, classes } = this.props;

    return (
      <Typography variant="h5" className={classes[renderTitle(title)]}>
        {title}
      </Typography>
    );
  }
}

export default withStyles(styles)(Title);
