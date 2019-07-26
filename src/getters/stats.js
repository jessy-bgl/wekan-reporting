import { DB_NAME } from "../constants";
import { countIO } from "../requests";

const getStats = async (client, listId_entries, listId_output) => {
  const db = client.db(DB_NAME);
  const date_debut_j7 = new Date();
  date_debut_j7.setDate(date_debut_j7.getDate() - 7);
  const date_debut_j30 = new Date();
  date_debut_j30.setDate(date_debut_j30.getDate() - 30);

  const created_j7 = await countIO(
    "createCard",
    db,
    listId_entries,
    date_debut_j7
  );
  const created_j30 = await countIO(
    "createCard",
    db,
    listId_entries,
    date_debut_j30
  );
  const archived_j7 = await countIO(
    "moveCard",
    db,
    listId_output,
    date_debut_j7
  );
  const archived_j30 = await countIO(
    "moveCard",
    db,
    listId_output,
    date_debut_j30
  );

  return {
    j7: { archived: archived_j7, created: created_j7 },
    j30: { archived: archived_j30, created: created_j30 }
  };
};

export default getStats;
