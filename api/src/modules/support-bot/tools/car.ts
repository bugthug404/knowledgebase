import sqlite3 from "sqlite3";

/////////// Car Rental Tools /////////

interface SearchCarRentalsOptions {
  location?: string;
  name?: string;
  priceTier?: string;
  startDate?: Date;
  endDate?: Date;
}

export function searchCarRentals({
  location,
  name,
  priceTier,
  startDate,
  endDate,
}: SearchCarRentalsOptions): Promise<any[]> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise<any>((resolve, reject) => {
    let query = "SELECT * FROM car_rentals WHERE 1=1";
    const params = [];

    if (location) {
      query += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    // For our tutorial, we will let you match on any dates and price tier.
    // (since our toy dataset doesn't have much data)

    conn.all(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const formattedResults = results.map((row) => {
          const result = {};
          for (const [key, value] of Object.entries(row)) {
            result[key] = value;
          }
          return result;
        });
        resolve(formattedResults);
      }
    });
  }).finally(() => {
    conn.close();
  });
}

export function bookCarRental(rentalId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE car_rentals SET booked = 1 WHERE id = ?",
      [rentalId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(`Car rental ${rentalId} successfully booked.`);
          } else {
            conn.close();
            resolve(`No car rental found with ID ${rentalId}.`);
          }
        }
      }
    );
  });
}

export function updateCarRental(
  rentalId: number,
  startDate?: Date,
  endDate?: Date
): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.serialize(() => {
      if (startDate) {
        conn.run(
          "UPDATE car_rentals SET start_date = ? WHERE id = ?",
          [startDate.toISOString(), rentalId],
          function (err) {
            if (err) {
              reject(err);
            }
          }
        );
      }

      if (endDate) {
        conn.run(
          "UPDATE car_rentals SET end_date = ? WHERE id = ?",
          [endDate.toISOString(), rentalId],
          function (err) {
            if (err) {
              reject(err);
            }
          }
        );
      }
    });

    conn.get(
      "SELECT COUNT(*) AS count FROM car_rentals WHERE id = ?",
      [rentalId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row.count > 0) {
            conn.close();
            resolve(`Car rental ${rentalId} successfully updated.`);
          } else {
            conn.close();
            resolve(`No car rental found with ID ${rentalId}.`);
          }
        }
      }
    );
  });
}

export function cancelCarRental(rentalId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE car_rentals SET booked = 0 WHERE id = ?",
      [rentalId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(`Car rental ${rentalId} successfully cancelled.`);
          } else {
            conn.close();
            resolve(`No car rental found with ID ${rentalId}.`);
          }
        }
      }
    );
  });
}
