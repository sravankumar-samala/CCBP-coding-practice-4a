const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db;
let numOfPlayers;

(async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server started at port 3000");
    });
  } catch (err) {
    console.log(`Database error ${err.message}`);
    process.exit(1);
  }
})();

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team
        ORDER BY player_id
    `;
  const playersArr = await db.all(getPlayersQuery);
  numOfPlayers = playersArr;
  console.log(numOfPlayers.length);
  res.send(playersArr);
});

app.get("/players/", async (req, res) => {
  try {
    const newPlayerDetails = req.body;
    const { playerName, jerseyNumber, role } = newPlayerDetails;
    const playerId = numOfPlayers.length + 1;
    const addPlayerQuery = `
    INSERT INTO cricket_team 
    (player_id, player_name, jersey_number, role)
    VALUES (
        '${playerId}',
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );
    `;
    await db.run(addPlayerQuery);
    res.send("Player Added to Team");
  } catch (err) {
    console.log(err.message);
  }
});
