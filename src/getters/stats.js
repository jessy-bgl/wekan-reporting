import { DB_NAME } from "../constants";
import { countIO } from "../requests";

const getStats = async (
  client,
  listId_input,
  listId_output,
  input_name = "createCard",
  output_name = "moveCard"
) => {
  const db = client.db(DB_NAME);
  const date_debut_j7 = new Date();
  date_debut_j7.setDate(date_debut_j7.getDate() - 7);
  const date_debut_j30 = new Date();
  date_debut_j30.setDate(date_debut_j30.getDate() - 30);

  const created_j7 = await countIO(input_name, db, listId_input, date_debut_j7);
  const created_j30 = await countIO(
    input_name,
    db,
    listId_input,
    date_debut_j30
  );
  const archived_j7 = await countIO(
    output_name,
    db,
    listId_output,
    date_debut_j7
  );
  const archived_j30 = await countIO(
    output_name,
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
