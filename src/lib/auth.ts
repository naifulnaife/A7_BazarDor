// import { betterAuth } from "better-auth";
// import { MongoClient } from "mongodb";
// import { mongodbAdapter } from "@better-auth/mongo-adapter";

// const client = new MongoClient(process.env.MONGODB_URL as string);
// const db = client.db("a7bazar_dor");

// export const auth = betterAuth({
//     emailAndPassword:{
//         enabled: true
//     },
//   database: mongodbAdapter(db, {
//     client,
//   }),
// });



import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  throw new Error("MONGODB_URL is missing from .env");
}

const client = new MongoClient(mongoUrl);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
});
;
