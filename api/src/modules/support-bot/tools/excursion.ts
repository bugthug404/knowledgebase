import sqlite3 from "sqlite3";

interface SearchTripRecommendationsOptions {
  location?: string;
  name?: string;
  keywords?: string;
}

export function searchTripRecommendations({
  location,
  name,
  keywords,
}: SearchTripRecommendationsOptions): Promise<any[]> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise<any[]>((resolve, reject) => {
    let query = "SELECT * FROM trip_recommendations WHERE 1=1";
    const params = [];

    if (location) {
      query += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    if (keywords) {
      const keyword_list = keywords.split(",");
      const keyword_conditions = keyword_list
        .map(() => "keywords LIKE ?")
        .join(" OR ");
      query += ` AND (${keyword_conditions})`;
      params.push(...keyword_list.map((keyword) => `%${keyword.trim()}%`));
    }

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

export function bookExcursion(recommendationId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE trip_recommendations SET booked = 1 WHERE id = ?",
      [recommendationId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(
              `Trip recommendation ${recommendationId} successfully booked.`
            );
          } else {
            conn.close();
            resolve(
              `No trip recommendation found with ID ${recommendationId}.`
            );
          }
        }
      }
    );
  });
}

export function updateExcursion(
  recommendationId: number,
  details: string
): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE trip_recommendations SET details = ? WHERE id = ?",
      [details, recommendationId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(
              `Trip recommendation ${recommendationId} successfully updated.`
            );
          } else {
            conn.close();
            resolve(
              `No trip recommendation found with ID ${recommendationId}.`
            );
          }
        }
      }
    );
  });
}

export function cancelExcursion(recommendationId: number): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.run(
      "UPDATE trip_recommendations SET booked = 0 WHERE id = ?",
      [recommendationId],
      function (err) {
        if (err) {
          reject(err);
        } else {
          if (this.changes > 0) {
            conn.close();
            resolve(
              `Trip recommendation ${recommendationId} successfully cancelled.`
            );
          } else {
            conn.close();
            resolve(
              `No trip recommendation found with ID ${recommendationId}.`
            );
          }
        }
      }
    );
  });
}
