import { ensureConfig } from "@langchain/core/runnables";
import sqlite3 from "sqlite3";

/////////  Flight  //////////

interface FlightInformation {
  ticket_no: string;
  book_ref: string;
  flight_id: string;
  flight_no: string;
  departure_airport: string;
  arrival_airport: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  seat_no: string;
  fare_conditions: string;
}

const config = ensureConfig();
const passenger_id = config.configurable;
console.log("passenger_id --- ", passenger_id);

export async function fetchUserFlightInformation(): Promise<
  FlightInformation[] | void
> {
  if (!passenger_id) throw new Error("passenger_id is not configured");

  const db = "travel2.sqlite";

  const conn = new sqlite3.Database(db);

  const query = `
    SELECT
      t.ticket_no, t.book_ref,
      f.flight_id, f.flight_no, f.departure_airport, f.arrival_airport, f.scheduled_departure, f.scheduled_arrival,
      bp.seat_no, tf.fare_conditions
    FROM
      tickets t
      JOIN ticket_flights tf ON t.ticket_no = tf.ticket_no
      JOIN flights f ON tf.flight_id = f.flight_id
      JOIN boarding_passes bp ON bp.ticket_no = t.ticket_no AND bp.flight_id = f.flight_id
    WHERE
      t.passenger_id = ?
  `;

  const result = new Promise<FlightInformation[]>((resolve, reject) => {
    conn.all(query, [passenger_id], (err, rows) => {
      console.log("rows --- ", rows);
      console.log("err --- ", err);
      if (err) {
        reject(err);
      } else {
        const results: FlightInformation[] = rows.map((row: any) => {
          return {
            ticket_no: row.ticket_no,
            book_ref: row.book_ref,
            flight_id: row.flight_id,
            flight_no: row.flight_no,
            departure_airport: row.departure_airport,
            arrival_airport: row.arrival_airport,
            scheduled_departure: row.scheduled_departure,
            scheduled_arrival: row.scheduled_arrival,
            seat_no: row.seat_no,
            fare_conditions: row.fare_conditions,
          };
        });
        resolve(results);
      }
    });
  }).finally(() => {
    conn.close();
  });

  console.log("result ---- ", result);
}

///////////

interface SearchFlightsOptions {
  departureAirport?: string;
  arrivalAirport?: string;
  startTime?: Date;
  endTime?: Date;
  limit?: number;
}

export function searchFlights({
  departureAirport,
  arrivalAirport,
  startTime,
  endTime,
  limit = 20,
}: SearchFlightsOptions): Promise<any[]> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise<any[]>((resolve, reject) => {
    let query = "SELECT * FROM flights WHERE 1 = 1";
    const params = [];

    if (departureAirport) {
      query += " AND departure_airport = ?";
      params.push(departureAirport);
    }

    if (arrivalAirport) {
      query += " AND arrival_airport = ?";
      params.push(arrivalAirport);
    }

    if (startTime) {
      query += " AND scheduled_departure >= ?";
      params.push(startTime.toISOString());
    }

    if (endTime) {
      query += " AND scheduled_departure <= ?";
      params.push(endTime.toISOString());
    }

    query += " LIMIT ?";
    params.push(limit);

    conn.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const results = rows.map((row) => {
          const result = {};
          for (const [key, value] of Object.entries(row)) {
            result[key] = value;
          }
          return result;
        });
        resolve(results);
      }
    });
  }).finally(() => {
    conn.close();
  });
}

//////////////////

export function updateTicketToNewFlight(
  ticketNo: string,
  newFlightId: number
): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.get(
      "SELECT departure_airport, arrival_airport, scheduled_departure FROM flights WHERE flight_id = ?",
      [newFlightId],
      (err, newFlight: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!newFlight) {
          conn.close();
          resolve("Invalid new flight ID provided.");
          return;
        }

        const currentTime = new Date();
        const departureTime = new Date(newFlight.scheduled_departure);
        const timeUntil =
          (departureTime.getTime() - currentTime.getTime()) / 1000;

        if (timeUntil < 3 * 3600) {
          conn.close();
          resolve(
            `Not permitted to reschedule to a flight that is less than 3 hours from the current time. Selected flight is at ${departureTime}.`
          );
          return;
        }

        conn.get(
          "SELECT flight_id FROM ticket_flights WHERE ticket_no = ?",
          [ticketNo],
          (err, currentFlight) => {
            if (err) {
              reject(err);
              return;
            }

            if (!currentFlight) {
              conn.close();
              resolve("No existing ticket found for the given ticket number.");
              return;
            }

            // Check the signed-in user actually has this ticket
            // (Assuming passenger_id is available in the context)
            conn.get(
              "SELECT * FROM tickets WHERE ticket_no = ? AND passenger_id = ?",
              [ticketNo, passenger_id],
              (err, currentTicket) => {
                if (err) {
                  reject(err);
                  return;
                }

                if (!currentTicket) {
                  conn.close();
                  resolve(
                    `Current signed-in passenger with ID ${passenger_id} not the owner of ticket ${ticketNo}`
                  );
                  return;
                }

                // In a real application, you'd likely add additional checks here to enforce business logic,
                // like "does the new departure airport match the current ticket", etc.
                // While it's best to try to be *proactive* in 'type-hinting' policies to the LLM
                // it's inevitably going to get things wrong, so you **also** need to ensure your
                // API enforces valid behavior
                conn.run(
                  "UPDATE ticket_flights SET flight_id = ? WHERE ticket_no = ?",
                  [newFlightId, ticketNo],
                  (err) => {
                    if (err) {
                      reject(err);
                      return;
                    }

                    conn.close();
                    resolve("Ticket successfully updated to new flight.");
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

/////////////////

export function cancelTicket(ticketNo: string): Promise<string> {
  const db = "travel2.sqlite";
  const conn = new sqlite3.Database(db);

  return new Promise((resolve, reject) => {
    conn.get(
      "SELECT flight_id FROM ticket_flights WHERE ticket_no = ?",
      [ticketNo],
      (err, existingTicket) => {
        if (err) {
          reject(err);
          return;
        }

        if (!existingTicket) {
          conn.close();
          resolve("No existing ticket found for the given ticket number.");
          return;
        }

        // Check the signed-in user actually has this ticket
        // (Assuming passenger_id is available in the context)
        conn.get(
          "SELECT flight_id FROM tickets WHERE ticket_no = ? AND passenger_id = ?",
          [ticketNo, passenger_id],
          (err, currentTicket) => {
            if (err) {
              reject(err);
              return;
            }

            if (!currentTicket) {
              conn.close();
              resolve(
                `Current signed-in passenger with ID ${passenger_id} not the owner of ticket ${ticketNo}`
              );
              return;
            }

            conn.run(
              "DELETE FROM ticket_flights WHERE ticket_no = ?",
              [ticketNo],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                conn.close();
                resolve("Ticket successfully cancelled.");
              }
            );
          }
        );
      }
    );
  });
}
