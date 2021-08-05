import { connectToDatabase, startServer } from "back-end/index"
import { Server } from "http";
import clearModule from 'clear-module'
import { cleanupDatabase } from "helpers/user";

export let app:Server;

before(async () => {
  await cleanupDatabase()
  app = await startServer()
})


after(async () => {
  await app.close()
  await clearModule.all() // Clear imported modules cache
  const connection = connectToDatabase();
  await connection.destroy()
})