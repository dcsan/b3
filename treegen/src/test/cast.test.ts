import { expect, test } from "vitest"
import { StoryMgr } from "../models/StoryMgr"
import exp from "constants"
// import { sum } from "./sum"

test("loads casts", async () => {
  const castList = await StoryMgr.findList()
  expect(castList).toBeDefined()
  expect(castList).toHaveLength(4)

  const cast = await StoryMgr.findByCname(castList[0].cname!)
  expect(cast).toBeDefined()
  expect(cast?.id).toBe(castList[0].id)
})
