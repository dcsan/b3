import ExpressConfig from "./config/ExpressConfig.js"
import { setupRoutes } from "./api/routes.js"
import { AppConfig } from "./config/AppConfig.js"
import express, { Application } from "express"

import { PrismaClient } from "@prisma/client"
import { castRouter } from "./api/stories.js"

const prisma = new PrismaClient()

async function main() {
  const app: Application = ExpressConfig()
  await setupRoutes(app)
  await castRouter(app)

  app.use(express.static("static"))

  app.listen(AppConfig.PORT, () =>
    console.log("Server Running on Port " + AppConfig.PORT)
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
