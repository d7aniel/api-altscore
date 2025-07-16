import express from "express";
import { Request, Response } from "express";

const app = express();
// const port = process.env.PORT || 3001; // Use environment variable or default to 3000
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hola, esta es una API escrita en TypeScript");
});

let sys: string = "navigation";
app.get("/status", (req: Request, res: Response) => {
  let sistemas = ["navigation", "communications", "life_support", "engines", "deflector_shield"];
  sys = sistemas[Math.round(Math.random() * sistemas.length)];
  res.json({ damaged_system: sys });
});

let info = {
  navigation: "NAV-01",
  communications: "COM-02",
  life_support: "LIFE-03",
  engines: "ENG-04",
  deflector_shield: "SHLD-05",
};
type FaultySystemKey = keyof typeof info;
app.get("/repair-bay", (req: Request, res: Response) => {
  if (typeof sys === "string" && sys in info) {
    let systemCode = info[sys as FaultySystemKey]; // Casteo explícito para mayor claridad, aunque 'in' ya lo maneja.

    const htmlResponse = `<!DOCTYPE html>
                        <html>
                            <head>
                                <title>Repair</title>
                            </head>
                            <body>
                                <div class="anchor-point">${systemCode}</div>
                            </body>
                        </html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(htmlResponse);
  }
});
app.post("/teapot", (req: Request, res: Response) => {
  res.status(418).send("I'm a teapot.");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
