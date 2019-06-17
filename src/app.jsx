import React from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
  background: {},
  root: {
    overflowX: "auto"
  },
  progress: {
    margin: theme.spacing(2)
  }
});

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        fontSize: "1.2rem",
        fontWeight: 600
      },
      head: {
        fontSize: "1.2rem",
        fontWeight: 600
      },
      body: {
        fontSize: "1.2rem",
        fontWeight: 600
      }
    }
  }
});

const URL = "http://192.168.237.206";
const ID_BOARD_PREPACOM = "EYrAphqdvn54kcJxh";
const ID_BOARD_SAV = "v2wRKwwGAbrWZbudm";
const AUTO_RELOAD = 1000 * 60 * 2; // 2 minutes

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data_preparation_commande: {},
      data_sav: {}
    };
  }

  async getReport(url, data_type) {
    let self = this;
    const req_lists = await axios.get(url);
    const lists = req_lists.data;
    await lists.map(async (list, index) => {
      const listID = list._id;
      const listName = list.title.toUpperCase();
      if (listName.includes("ARCHIVE")) return;
      let nbCardsMA2 = 0;
      let nbCardsM2M = 0;
      let nbExpired = 0;
      let nbNotExpired = 0;
      const req_cards = await axios.get(url + listID + "/cards");
      const cards = req_cards.data;
      //await cards.map(async card => {
      for (const card of cards) {
        const cardID = card._id;
        const req_card = await axios.get(url + listID + "/cards/" + cardID);
        const details = req_card.data;
        // MA2 or M2M
        if (details.color === "green") nbCardsMA2 += 1;
        else if (details.color === "sky") nbCardsM2M += 1;
        // Expired or not
        if (details.dueAt && new Date(details.dueAt) <= Date.now())
          nbExpired += 1;
        else nbNotExpired += 1;
      }
      // State update
      let stateData = await Object.assign({}, self.state[data_type]);
      stateData[listName] = {
        ["nbCardsMA2"]: nbCardsMA2,
        ["nbCardsM2M"]: nbCardsM2M,
        ["nbExpired"]: nbExpired,
        ["nbNotExpired"]: nbNotExpired
      };
      await self.setState({ [data_type]: stateData });
    });
  }

  async main() {
    let self = this;
    console.log("MAIN");
    // Auth (fetch token)
    const req = await axios.post(URL + "/users/login", {
      username: "admin",
      password: "Admin12345!"
    });
    if (!req) return;
    const token = req.data.token;
    // Set defaults axios
    axios.defaults.baseURL = URL;
    axios.defaults.headers.common = { Authorization: `bearer ${token}` };
    // First board : Preparation Commande
    await self.getReport(
      "/api/boards/" + ID_BOARD_PREPACOM + "/lists/",
      "data_preparation_commande"
    );
    // Second board : SAV
    await self.getReport("/api/boards/" + ID_BOARD_SAV + "/lists/", "data_sav");
    self.setState({ loading: false });
  }

  async componentDidMount() {
    await this.main();

    this.interval = setInterval(() => {
      this.main();
    }, AUTO_RELOAD);
  }

  renderNbCards(elem) {
    if (typeof elem === "number") {
      if (elem <= 5) return <span style={{ color: "green" }}>{elem}</span>;
      else if (elem <= 10)
        return <span style={{ color: "orange" }}>{elem}</span>;
      else return <span style={{ color: "red" }}>{elem}</span>;
    } else return <span>{elem}</span>;
  }

  renderTitle(title) {
    return (
      <Typography
        variant="h5"
        style={{
          textAlign: "center",
          marginTop: 10,
          backgroundColor: "lightgrey"
        }}
      >
        {title}
      </Typography>
    );
  }

  render() {
    const { classes } = this.props;
    const { data_preparation_commande, data_sav } = this.state;

    if (this.state.loading)
      return (
        <div style={{ textAlign: "center" }}>
          <CircularProgress className={classes.progress} />
        </div>
      );

    const columns = ["Liste", "MA2", "M2M", "Hors délais", "Dans les délais"];

    let data1 = [];
    Object.keys(data_preparation_commande).map(liste => {
      data1.push([
        liste,
        data_preparation_commande[liste]["nbCardsMA2"],
        data_preparation_commande[liste]["nbCardsM2M"],
        data_preparation_commande[liste]["nbExpired"],
        data_preparation_commande[liste]["nbNotExpired"]
      ]);
    });
    let data2 = [];
    Object.keys(data_sav).map(liste => {
      data2.push([
        liste,
        data_sav[liste]["nbCardsMA2"],
        data_sav[liste]["nbCardsM2M"],
        data_sav[liste]["nbExpired"],
        data_sav[liste]["nbNotExpired"]
      ]);
    });

    return (
      <div className={classes.background}>
        <MuiThemeProvider theme={theme}>
          <Paper className={classes.root}>
            {this.renderTitle("Péparation commande")}
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(column => {
                    return <TableCell key={column}>{column}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data1.map(d => (
                  <TableRow>
                    {d.map(e => (
                      <TableCell>{this.renderNbCards(e)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper className={classes.root} style={{ marginTop: 10 }}>
            {this.renderTitle("SAV")}
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map(column => {
                    return <TableCell key={column}>{column}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data2.map(d => (
                  <TableRow>
                    {d.map(e => (
                      <TableCell>{this.renderNbCards(e)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(App);
