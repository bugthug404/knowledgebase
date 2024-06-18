import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import axios from "axios";
import moment from "moment-timezone";

export async function fixTiming() {
  const dbUrl =
    "https://storage.googleapis.com/benchmarks-artifacts/travel-db/travel2.sqlite";
  const localFile = "travel.sqlite";
  //   const lf = fs.readFileSync(localFile);
  const backupFile = "travel.backup.sqlite";
  const overwrite = false;

  // This function downloads the travel2.sqlite file from the provided URL
  // and saves it to the local file system. It also creates a backup file.
  const downloadFile = async () => {
    const response = await axios.get(dbUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(localFile, Buffer.from(response.data));
    fs.copyFileSync(localFile, backupFile);
  };

  // This function converts the datetime columns in the database to the present time
  const convertToPresent = async () => {
    const db = new sqlite3.Database(localFile);
    const get = promisify(db.get.bind(db));
    const all = promisify(db.all.bind(db));
    const run = promisify(db.run.bind(db));

    // Get the list of tables in the database
    const tables = (
      await all("SELECT name FROM sqlite_master WHERE type='table';")
    ).map((row) => row.name);

    // Load all data from the tables into an object
    const tdf: { [key: string]: any[] } = {};
    for (const table of tables) {
      tdf[table] = await all(`SELECT * FROM ${table}`);
    }
    console.log("flights --- ", tdf.flights);
    // Find the maximum actual_departure time from the flights table
    const exampleTime = moment.max(
      tdf.flights
        .map((flight) => {
          const tm = moment(flight.actual_departure, "YYYY-MM-DD HH:mm:ss");
          return tm.isValid() ? tm : null;
        })
        .filter(Boolean)
    );
    const currentTime = exampleTime.tz()
      ? moment().tz(exampleTime.tz())
      : moment();
    console.log("currentTime ", currentTime);
    const timeDiff = currentTime.diff(exampleTime);

    // Update the book_date column in the bookings table
    tdf.bookings.forEach((booking) => {
      console.log("foreach 1 ", booking.book_date);
      booking.book_date = moment(booking.book_date, "YYYY-MM-DD HH:mm:ss")
        .add(timeDiff, "milliseconds")
        .toISOString();
    });

    // Update the datetime columns in the flights table
    const datetimeColumns = [
      "scheduled_departure",
      "scheduled_arrival",
      "actual_departure",
      "actual_arrival",
    ];
    tdf.flights.forEach((flight) => {
      console.log("forEach 2 ", flight.scheduled_departure);
      datetimeColumns.forEach((column) => {
        flight[column] = moment(flight[column], "YYYY-MM-DD HH:mm:ss")
          .add(timeDiff, "milliseconds")
          .toISOString();
      });
    });

    await run("BEGIN TRANSACTION");

    // Drop and recreate the tables, then insert the updated data
    for (const [tableName, data] of Object.entries(tdf)) {
      console.log("for 3 ", tableName);
      await run(`DROP TABLE IF EXISTS ${tableName}`);
      await run(
        `CREATE TABLE ${tableName} (${Object.keys(data[0])
          .map((key) => `${key} TEXT`)
          .join(", ")})`
      );
      const placeholders = data[0]
        ? `(${Object.keys(data[0])
            .map(() => "?")
            .join(", ")})`
        : "";
      const insert = db.prepare(
        `INSERT INTO ${tableName} VALUES ${placeholders}`
      );
      for (const row of data) {
        insert.run(Object.values(row));
      }
      await promisify(insert.finalize.bind(insert))();
    }
    await run("COMMIT"); // Commit the transaction after each iteration

    await promisify(db.close.bind(db))();
  };

  if (overwrite || !fs.existsSync(localFile)) {
    await downloadFile();
    console.log("Downloaded file");
  }
  await convertToPresent();
}
