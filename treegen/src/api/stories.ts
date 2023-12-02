import { Application } from "express"
import { StoryMgr } from "../models/StoryMgr.js"
import { Clog } from "../utils/Clog.js"
const clog = new Clog()

function sendData(res: any, data: any) {
  clog.log("data", data)
  res.status(200).json({ data })
}

export async function castRouter(app: Application) {
  app.get("/api/storylist", async (_req: Express.Request, res: any) => {
    const castList = await StoryMgr.findList()
    sendData(res, castList)
  })

  app.get("/api/story/:cname", async (_req: any, res: any) => {
    const cast = await StoryMgr.findByCname(_req.params.cname)
    sendData(res, cast)
  })

  app.get("/api/castNum/:num", async (_req: any, res: any) => {
    const num = parseInt(_req.params.num)
    const cast = await StoryMgr.findWhere({ num })
    sendData(res, cast)
  })
}
