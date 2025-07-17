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
app.get("/phaseA/phase-change-diagram", (req: Request, res: Response) => {
  const pressureQuery = req.query.pressure as string;
  const pressure = parseFloat(pressureQuery);
  // --- Datos extraídos directamente de la imagen del diagrama P-V ---
  // Punto 1: Baja presión (en la isoterma de 30°C)
  const P1 = 0.05; // MPa
  const vf1 = 0.00105; // m^3/kg
  const vg1 = 30.0; // m^3/kg

  // Punto 2: Punto Crítico (donde vf = vg = vc)
  const P2_critical = 10.0; // MPa
  const vf2_critical = 0.0035; // m^3/kg
  const vg2_critical = 0.0035; // m^3/kg
  // --- Fin de datos extraídos ---

  let interpolatedVf: number | null = null;
  let interpolatedVg: number | null = null;
  let phase: string = "unknown";

  if (isNaN(pressure)) {
    return res.status(400).json({ error: "Parámetro 'pressure' no válido. Debe ser un número." });
  }

  // Manejo de casos de borde y rango
  if (pressure < P1) {
    phase = "below_interpolation_range";
    // Podrías decidir qué valores devolver aquí, quizás los de P1 o null
    interpolatedVf = null;
    interpolatedVg = null;
    console.warn(`Presión ${pressure} MPa está por debajo del rango de interpolación (${P1} MPa).`);
  } else if (pressure > P2_critical) {
    phase = "supercritical_fluid";
    interpolatedVf = null; // No hay distinción entre vf y vg en el fluido supercrítico
    interpolatedVg = null;
    console.warn(`Presión ${pressure} MPa está por encima del punto crítico (${P2_critical} MPa).`);
  } else if (pressure === P1) {
    // Exactamente en el punto de baja presión
    interpolatedVf = vf1;
    interpolatedVg = vg1;
    phase = "saturated_liquid_vapor_low_pressure";
  } else if (pressure === P2_critical) {
    // Exactamente en el punto crítico
    interpolatedVf = vf2_critical;
    interpolatedVg = vg2_critical;
    phase = "critical_point";
  } else {
    // Realizar interpolación lineal para presiones dentro del rango [P1, P2_critical]
    // Para vf:
    interpolatedVf = vf1 + ((pressure - P1) * (vf2_critical - vf1)) / (P2_critical - P1);
    // Para vg:
    interpolatedVg = vg1 + ((pressure - P1) * (vg2_critical - vg1)) / (P2_critical - P1);

    phase = "saturated_liquid_vapor";
  }

  res.json({
    specific_volume_liquid: interpolatedVf,
    specific_volume_vapor: interpolatedVg,
  });
});

app.get("/phaseB/phase-change-diagram", (req: Request, res: Response) => {
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

    pressure = parseFloat(pressureQuery);
    if (!isNaN(pressure)) {
      if (pressure != 10) {
        let slope_liquido = (l_max - l_min) / (p_max - p_min);
        let slope_vapor = (v_max - v_min) / (p_max - p_min);
        specific_volume_liquid = l_min + slope_liquido * (pressure - p_min);
        specific_volume_vapor = v_min + slope_vapor * (pressure - p_min);
      }
      console.log(`Parámetro 'pressure' es: "${pressure}"`);
    } else {
      console.warn(`Parámetro 'pressure' no válido: "${pressureQuery}"`);
    }

    res.json({
      specific_volume_liquid: specific_volume_liquid,
      specific_volume_vapor: specific_volume_vapor,
    });
  } else {
    res.json({});
  }
});

app.get("/phaseC/phase-change-diagram", (req: Request, res: Response) => {
  let specific_volume_liquid: number = 0.0035;
  let specific_volume_vapor: number = 0.0035;

  res.json({
    specific_volume_liquid: specific_volume_liquid,
    specific_volume_vapor: specific_volume_vapor,
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
