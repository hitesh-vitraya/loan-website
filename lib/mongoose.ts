import mongoose from "mongoose";

declare global {
  var __loanOptionsMongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function connectMongoose() {
  if (!global.__loanOptionsMongooseConnectionPromise) {
    global.__loanOptionsMongooseConnectionPromise = mongoose.connect(getRequiredEnv("MONGODB_URI"), {
      dbName: getRequiredEnv("MONGODB_DB"),
      bufferCommands: false
    });
  }

  return global.__loanOptionsMongooseConnectionPromise;
}
