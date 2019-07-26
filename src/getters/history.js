import { DB_NAME } from "../constants";
import { periodicCountIO } from "../requests";

const getHistory = async (client, listId_entries, listId_output) => {
  const db = client.db(DB_NAME);
  const date_debut = new Date();
  date_debut.setMonth(date_debut.getMonth() - 12);

  // Entries
  const entries = await periodicCountIO(
    "createCard",
    db,
    listId_entries,
    date_debut
  );
  const monthly_entries = await periodicCountIO(
    "createCard",
    db,
    listId_entries,
    date_debut,
    "month"
  );
  const data_to_print = await Object.entries(entries).map((item, index) => {
    return { name: item[0], ["entrées"]: item[1] };
  });
  await Object.entries(monthly_entries).map(async (item, index) => {
    const i = await data_to_print.findIndex(elem => elem.name === item[0]);
    if (i >= 0) data_to_print[i]["entrées mensuelles"] = item[1];
  });

  // Output
  const output = await periodicCountIO(
    "moveCard",
    db,
    listId_output,
    date_debut
  );
  const monthly_output = await periodicCountIO(
    "moveCard",
    db,
    listId_output,
    date_debut,
    "month"
  );
  await Object.entries(output).map((item, index) => {
    data_to_print[index]["sorties"] = item[1];
  });
  await Object.entries(monthly_output).map(async (item, index) => {
    const i = await data_to_print.findIndex(elem => elem.name === item[0]);
    if (i >= 0) data_to_print[i]["sorties mensuelles"] = item[1];
  });

  return data_to_print;
};

export default getHistory;
