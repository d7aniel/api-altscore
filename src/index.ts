import express from "express";
import { Request, Response } from "express";

const app = express();
// const port = process.env.PORT || 3001; // Use environment variable or default to 3000
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

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

// Pc = 10 //Megapascales

// Pc = 10MPa
// Tc = 500°C
// vc = 0.0035m^3/kg

// liquido saturado = 0.00105;
// vapor saturado = 30;

// Presion 0.05

// MV/(ML+MV)

// T1const = 30°c
// 30/(0+30);
app.get("/phase-change-diagram", (req: Request, res: Response) => {
  const pressureQuery = req.query.pressure as string;
  let pressure: number | null = null;
  let specific_volume_liquid: number = 0.0035;
  let specific_volume_vapor: number = 0.0035;

  if (pressureQuery) {
    let p_min = 0.05;
    let p_max = 10.0;
    let v_min = 30.0;
    let v_max = 0.0035;
    let l_min = 0.00105;
    let l_max = 0.0035;

    // double slope = 1.0 * (output_end - output_start) / (input_end - input_start)
    // output = output_start + slope * (input - input_start)

    pressure = parseFloat(pressureQuery);
    if (!isNaN(pressure)) {
      let slope_liquido = (1.0 * (l_max - l_min)) / (p_max - p_min);
      let slope_vapor = (1.0 * (v_max - v_min)) / (p_max - p_min);
      // specific_volume_liquid = l_min + slope_liquido * (pressure - p_min);
      // specific_volume_vapor = v_min + slope_vapor * (pressure - p_min);
      // specific_volume_liquid = Math.round(specific_volume_liquid * 100000) / 100000;
      // specific_volume_vapor = Math.round(specific_volume_vapor * 100000) / 100000;
      console.log(`Parámetro 'pressure' es: "${pressure}"`);
    } else {
      console.warn(`Parámetro 'pressure' no válido: "${pressureQuery}"`);
    }
  } else {
    console.warn("Parámetro 'pressure' no proporcionado.");
  }

  res.json({
    specific_volume_liquid: specific_volume_liquid,
    specific_volume_vapor: specific_volume_vapor,
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
