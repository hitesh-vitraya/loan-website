import mysql, { Pool } from "mysql2/promise";

declare global {
  var __loanOptionsMysqlPool: Pool | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getMysqlPool() {
  if (!global.__loanOptionsMysqlPool) {
    global.__loanOptionsMysqlPool = mysql.createPool({
      host: getRequiredEnv("MYSQL_HOST"),
      port: Number(process.env.MYSQL_PORT ?? 3306),
      user: getRequiredEnv("MYSQL_USER"),
      password: process.env.MYSQL_PASSWORD ?? "",
      database: getRequiredEnv("MYSQL_DATABASE"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return global.__loanOptionsMysqlPool;
}
