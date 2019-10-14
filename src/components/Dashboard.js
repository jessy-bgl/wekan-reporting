import React from "react";
import { Link } from "react-router-dom";
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
  ID_BOARD_PRETS,
  ID_LIST_COMMANDE_A_EXPEDIER,
  ID_LIST_COMMANDE_A_PREPARER,
  ID_LIST_SAV_A_TRAITER,
  ID_LIST_SAV_A_RETOURNER,
  ID_LIST_PRETS_EN_COURS,
  ID_LIST_RECEPTION_PRETS,
  AUTO_RELOAD,
  COLUMNS
} from "../constants";

import History from "../components/History";
import Title from "../renders/title";
import Table from "../renders/table";
import Stats from "../renders/stats";
import getStats from "../getters/stats";

import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import NavigateNext from "@material-ui/icons/NavigateNext";

const styles = theme => ({
  background: {},
  root: { width: "100%", overflowX: "hidden" },
  progress: { margin: theme.spacing(2) },
  margin: { margin: theme.spacing(1) }
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

class Dashboard extends React.Component {
  // Constructor
  constructor(props) {
    super(props);
    this.state = {
      data_preparation_commande: [],
      data_sav: [],
      data_prets: [],
      stats_preparation_commande: {
        j7: { archived: null, created: null },
        j30: { archived: null, created: null }
      },
      stats_sav: {
        j7: { archived: null, created: null },
        j30: { archived: null, created: null }
      },
      stats_prets: {
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
    // Third board : PRETS
    await self.fetchReport(
      "/api/boards/" + ID_BOARD_PRETS + "/lists/",
      "data_prets"
    );
    // DB Statistics
    await self.fetchStats();
  }

  // fetch report data and update state
  async fetchReport(url, data_type) {
    let self = this;
    const req_lists = await axios.get(url);
    const lists = req_lists.data;
    let res = [];
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
      const stateData = [
        listName,
        nbCardsMA2,
        nbCardsM2M,
        nbExpired,
        nbNotExpired
      ];
      res[index] = stateData;
      await self.setState({ [data_type]: res });
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
          ID_LIST_COMMANDE_A_PREPARER,
          ID_LIST_COMMANDE_A_EXPEDIER
        );
        this.setState({ stats_preparation_commande });
        // Stats SAV
        const stats_sav = await getStats(
          client,
          ID_LIST_SAV_A_TRAITER,
          ID_LIST_SAV_A_RETOURNER
        );
        this.setState({ stats_sav });
        // Stats PRETS
        const stats_prets = await getStats(
          client,
          ID_LIST_RECEPTION_PRETS,
          ID_LIST_PRETS_EN_COURS,
          "moveCard"
        );
        this.setState({ stats_prets });
        // CLosing session
        client.close();
      }
    );
  }

  // Render
  render() {
    const { classes } = this.props;
    const {
      data_preparation_commande,
      data_sav,
      data_prets,
      stats_preparation_commande,
      stats_sav,
      stats_prets
    } = this.state;

    const keys1 = Object.keys(data_preparation_commande);
    const keys2 = Object.keys(data_sav);
    const keys3 = Object.keys(data_prets);
    if (keys1.length < 4 || keys2.length < 4 || keys3.length < 5)
      return <LinearProgress className={classes.progress} />;

    return (
      <div className={classes.background}>
        <MuiThemeProvider theme={theme}>
          <Paper className={classes.root}>
            <Title title={"Péparation commande"} />
            <Stats stats={stats_preparation_commande} />
            <Divider />
            <Table columns={COLUMNS} data={data_preparation_commande} />
          </Paper>
          <Paper className={classes.root} style={{ marginTop: 10 }}>
            <Title title={"SAV"} />
            <Stats stats={stats_sav} />
            <Divider />
            <Table columns={COLUMNS} data={data_sav} />
          </Paper>
          <Paper className={classes.root} style={{ marginTop: 10 }}>
            <Title title={"Prêts"} />
            <Stats stats={stats_prets} />
            <Divider />
            <Table columns={COLUMNS} data={data_prets} />
          </Paper>

          <Grid container justify="flex-end" style={{ marginTop: 10 }}>
            <Button
              variant="contained"
              color="primary"
              to="/history"
              component={Link}
              className={classes.margin}
            >
              Historique détaillé
              <NavigateNext />
            </Button>
          </Grid>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);
