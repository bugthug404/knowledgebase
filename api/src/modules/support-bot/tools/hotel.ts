import sqlite3 from "sqlite3";

interface SearchHotelsOptions {
  location?: string;
  name?: string;
  priceTier?: string;
  checkinDate?: Date;
  checkoutDate?: Date;
}

export function searchHotels({
  location,
  name,
  priceTier,
  checkinDate,
  checkoutDate,
}: SearchHotelsOptions): Promise<any[]> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise<any[]>((resolve, reject) => {
    let query = "SELECT * FROM hotels WHERE 1=1";
    const params = [];

    if (location) {
      query += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    // For the sake of this tutorial, we will let you match on any dates and price tier.

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

export function bookHotel(hotelId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE hotels SET booked = 1 WHERE id = ?",
      [hotelId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(`Hotel ${hotelId} successfully booked.`);
          } else {
            conn.close();
            resolve(`No hotel found with ID ${hotelId}.`);
          }
        }
      }
    );
  });
}

export function updateHotel(
  hotelId: number,
  checkinDate?: Date,
  checkoutDate?: Date
): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.serialize(() => {
      if (checkinDate) {
        conn.run(
          "UPDATE hotels SET checkin_date = ? WHERE id = ?",
          [checkinDate.toISOString(), hotelId],
          function (err) {
            if (err) {
              reject(err);
            }
          }
        );
      }

      if (checkoutDate) {
        conn.run(
          "UPDATE hotels SET checkout_date = ? WHERE id = ?",
          [checkoutDate.toISOString(), hotelId],
          function (err) {
            if (err) {
              reject(err);
            }
          }
        );
      }
    });

    conn.get(
      "SELECT COUNT(*) AS count FROM hotels WHERE id = ?",
      [hotelId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row.count > 0) {
            conn.close();
            resolve(`Hotel ${hotelId} successfully updated.`);
          } else {
            conn.close();
            resolve(`No hotel found with ID ${hotelId}.`);
          }
        }
      }
    );
  });
}

export function cancelHotel(hotelId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE hotels SET booked = 0 WHERE id = ?",
      [hotelId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(`Hotel ${hotelId} successfully cancelled.`);
          } else {
            conn.close();
            resolve(`No hotel found with ID ${hotelId}.`);
          }
        }
      }
    );
  });
}
