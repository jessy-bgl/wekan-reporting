import assert from "assert";

export const countArchivedCards = async (db, boardId, date_start) => {
  // Get the documents collection
  const cards = db.collection("cards");
  const res = await cards
    .find({ boardId, archived: true, dateLastActivity: { $gt: date_start } })
    .count();
  return res;
};

export const countCreatedCards = async (db, boardId, date_start) => {
  // Get the documents collection
  const cards = db.collection("cards");
  const res = await cards
    .find({ boardId, archived: false, createdAt: { $gt: date_start } })
    .count();
  return res;
};

// counter of entries/output
export const countIO = async (type, db, listId, date_start) => {
  const activities = db.collection("activities");
  let res = {};
  let date_counter = new Date(date_start);
  while (date_counter < new Date()) {
    res[date_counter.toLocaleDateString()] = 0;
    date_counter.setHours(date_counter.getHours() + 24);
  }

  const results = await activities.aggregate([
    {
      $match: {
        listId,
        activityType: type,
        createdAt: { $gt: date_start }
      }
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        },
        total_cards: { $sum: 1 }
      }
    },
    {
      $project: {
        day: "$_id.day",
        month: "$_id.month",
        year: "$_id.year",
        total_cards: "$total_cards"
      }
    }
  ]);

  const array_results = await results.toArray();
  await array_results.forEach(elem => {
    const date_in_res = new Date(`${elem.month}/${elem.day}/${elem.year}`);
    const date_string = date_in_res.toLocaleDateString();
    if (res[date_string]) res[date_string] += elem.total_cards;
    else res[date_string] = elem.total_cards;
  });

  const reducer = (acc, value) => acc + value;
  return Object.values(res).reduce((acc, value) => acc + value);
};
