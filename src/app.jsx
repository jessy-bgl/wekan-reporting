import React from "react";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { MongoClient } from "mongodb";
import assert from "assert";
import {
  URL,
  MONGO_URL,
  ID_BOARD_PREPACOM,
  ID_BOARD_SAV,
  ID_LIST_COMMANDE_A_EXPEDIER,
  ID_LIST_COMMANDE_A_PREPARER,
  ID_LIST_SAV_A_TRAITER,
  ID_LIST_SAV_A_RETOURNER,
  AUTO_RELOAD,
  COLUMNS
} from "./constants";

import Title from "./renders/title";
import Table from "./renders/table";
import Stats from "./renders/stats";
import getStats from "./getters/stats";

import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import LinearProgress from "@material-ui/core/LinearProgress";

const styles = theme => ({
  background: {},
  root: { overflowX: "hidden" },
  progress: { margin: theme.spacing(2) }
});

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: { fontSize: "1.2rem", fontWeight: 600 },
      head: { fontSize: "1.2rem", fontWeight: 600 },
      body: { fontSize: "1.2rem", fontWeight: 600 }
    }
  }
});

class App extends React.Component {
  // Constructor
  constructor(props) {
    super(props);
    this.state = {
      data_preparation_commande: {},
      data_sav: {},
      stats_preparation_commande: {
        j7: { archived: null, created: null },
        j30: { archived: null, created: null }
      },
      stats_sav: {
        j7: { archived: null, created: null },
        j30: { archived: null, created: null }
      }
    };
  }

  // componentDidMount
  async componentDidMount() {
    await this.main();
    this.interval = setInterval(() => {
      this.main();
    }, AUTO_RELOAD);
  }

  // Main function : called every 2 min
  async main() {
    let self = this;
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
    await self.fetchReport(
      "/api/boards/" + ID_BOARD_PREPACOM + "/lists/",
      "data_preparation_commande"
    );
    // Second board : SAV
    await self.fetchReport(
      "/api/boards/" + ID_BOARD_SAV + "/lists/",
      "data_sav"
    );
    // DB Statistics
    await self.fetchStats();
  }

  // fetch report data and update state
  async fetchReport(url, data_type) {
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
      stateData[listName] = { nbCardsMA2, nbCardsM2M, nbExpired, nbNotExpired };
      await self.setState({ [data_type]: stateData });
    });
  }

  // fetch stats data and update state
  async fetchStats() {
    MongoClient.connect(
      MONGO_URL,
      { useNewUrlParser: true },
      async (err, client) => {
        assert.equal(null, err);
        // Stats Preparation Commande
        const stats_preparation_commande = await getStats(
          client,
          "stats_preparation_commande",
          ID_LIST_COMMANDE_A_PREPARER,
          ID_LIST_COMMANDE_A_EXPEDIER
        );
        this.setState({ stats_preparation_commande });
        // Stats SAV
        const stats_sav = await getStats(
          client,
          "stats_preparation_commande",
          ID_LIST_SAV_A_TRAITER,
          ID_LIST_SAV_A_RETOURNER
        );
        this.setState({ stats_sav });
        // CLosing sesion
        client.close();
      }
    );
  }

  // convert data to make it printable (table compatibility)
  convertData(data) {
    let res = [];
    Object.keys(data).map(liste => {
      res.push([
        liste,
        data[liste]["nbCardsMA2"],
        data[liste]["nbCardsM2M"],
        data[liste]["nbExpired"],
        data[liste]["nbNotExpired"]
      ]);
    });
    return res;
  }

  // Render
  render() {
    const { classes } = this.props;
    const {
      data_preparation_commande,
      data_sav,
      stats_preparation_commande,
      stats_sav
    } = this.state;

    const keys1 = Object.keys(data_preparation_commande);
    const keys2 = Object.keys(data_sav);
    if (keys1.length < 4 || keys2.length < 4)
      return <LinearProgress className={classes.progress} />;

    const data1 = this.convertData(data_preparation_commande);
    const data2 = this.convertData(data_sav);

    return (
      <div className={classes.background}>
        <MuiThemeProvider theme={theme}>
          <Paper className={classes.root}>
            <Title title={"Péparation commande"} />
            <Stats stats={stats_preparation_commande} />
            <Divider />
            <Table columns={COLUMNS} data={data1} />
          </Paper>
          <Paper className={classes.root} style={{ marginTop: 10 }}>
            <Title title={"SAV"} />
            <Stats stats={stats_sav} />
            <Divider />
            <Table columns={COLUMNS} data={data2} />
          </Paper>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(App);
