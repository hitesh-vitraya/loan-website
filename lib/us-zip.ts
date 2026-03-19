import { RowDataPacket } from "mysql2";

import { getMysqlPool } from "./mysql";

export type UsZipLookupResult = {
  city: string;
  state: string;
};

type ZipRow = RowDataPacket & {
  city: string;
  state: string;
};

const configuredZipTableName = process.env.MYSQL_ZIP_LOOKUP_TABLE ?? "timezonebyzipcode";
const zipTableName = /^[A-Za-z0-9_]+$/.test(configuredZipTableName)
  ? configuredZipTableName
  : "timezonebyzipcode";

export async function lookupUsZip(zip: string): Promise<UsZipLookupResult | null> {
  const pool = getMysqlPool();

  const [rows] = await pool.execute<ZipRow[]>(
    `SELECT city, state
     FROM ${zipTableName}
     WHERE zip = ? AND country = 'United States'
     ORDER BY idtimezonebyzipcode ASC
     LIMIT 1`,
    [zip]
  );

  const location = rows[0];

  if (!location?.city || !location?.state) {
    return null;
  }

  return {
    city: String(location.city).trim(),
    state: String(location.state).trim()
  };
}
