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

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// getting all the players list
app.get("/players/", async (req, res) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team
        ORDER BY player_id;
    `;
  const playersArr = await db.all(getPlayersQuery);
  numOfPlayers = playersArr;
  console.log(numOfPlayers.length);
  res.send(
    playersArr.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// posting new player into the table

app.post("/players/", async (req, res) => {
  try {
    const newPlayerDetails = req.body;
    const { playerName, jerseyNumber, role } = newPlayerDetails;
    const playerId = numOfPlayers.length + 1;
    console.log(playerName, jerseyNumber, role);
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

// getting specific player from the table

app.get("/players/:playerId/", async (req, res) => {
  try {
    const { playerId } = req.params;
    const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
    const playerObj = await db.get(getPlayerQuery);
    const player = [playerObj].map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    );
    res.send(player[0]);
    // res.send(playerObj);
  } catch (err) {
    console.log(err.message);
  }
});

// updating the player

app.put("/players/:Id/", async (req, res) => {
  try {
    const playerId = req.params.Id;
    const playerDetails = req.body;
    const { playerName, jerseyNumber, role } = playerDetails;
    const addPlayerQuery = `
         UPDATE cricket_team SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
      WHERE player_id = ${playerId};
        `;
    await db.run(addPlayerQuery);
    res.send("Player Details Updated");
  } catch (err) {
    console.log(err.message);
  }
});

// Deleting the player

app.delete("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;
    const delPlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};
    `;
    await db.run(delPlayerQuery);
    response.send(`Player Removed`);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = app;
