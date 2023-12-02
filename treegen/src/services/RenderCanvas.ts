// import fs from "fs"
// import { createCanvas, loadImage } from "canvas"
// import { AppConfig } from "../config/AppConfig.js"
// import path from "path"

// const renderConfig = {
//   width: 512,
//   height: 512,
// }

// export type RenderParams = {
//   text: string
//   color: string
// }

// export async function renderImage(params: RenderParams) {
//   const canvas = createCanvas(renderConfig.width, renderConfig.height)
//   const ctx = canvas.getContext("2d")

//   ctx.rect(0, 0, 100, 50)
//   ctx.fillStyle = params.color
//   ctx.fill()

//   // Write "Awesome!"
//   ctx.fillStyle = params.color
//   ctx.font = "30px Impact"
//   // ctx.rotate(0.1)
//   ctx.fillText(params.text, 50, 100)

//   // Draw line under text
//   var text = ctx.measureText(params.text)
//   // ctx.strokeStyle = "rgba(0,0,0,0.5)"
//   ctx.strokeStyle = params.color
//   ctx.lineWidth = 5
//   ctx.beginPath()
//   ctx.lineTo(50, 110)
//   ctx.lineTo(50 + text.width, 110)
//   ctx.stroke()

//   const fp = path.join(AppConfig.rootPath, "../renders", "test.png")
//   const out = fs.createWriteStream(fp)
//   const stream = canvas.createPNGStream()
//   stream.pipe(out)
//   out.on("finish", () => console.log("wrote file to " + fp))

//   // Draw cat with lime helmet
//   // loadImage("examples/images/lime-cat.jpg").then((image: any) => {
//   //   ctx.drawImage(image, 50, 0, 70, 70)

//   //   console.log('<img src="' + canvas.toDataURL() + '" />')
//   // })
// }
