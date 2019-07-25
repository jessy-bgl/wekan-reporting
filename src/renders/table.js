import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

// render nb cards with color
function renderNbCards(elem) {
  if (typeof elem === "number") {
    if (elem <= 5) return <span style={{ color: "green" }}>{elem}</span>;
    else if (elem <= 10) return <span style={{ color: "orange" }}>{elem}</span>;
    else return <span style={{ color: "red" }}>{elem}</span>;
  } else return <span>{elem}</span>;
}

const MyTable = ({ columns, data }) => (
  <Table>
    <TableHead>
      <TableRow>
        {columns.map(column => (
          <TableCell>{column}</TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map(d => (
        <TableRow>
          {d.map(e => (
            <TableCell>{renderNbCards(e)}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default MyTable;
