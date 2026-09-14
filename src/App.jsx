import React, { useState, useMemo, useRef } from "react";
import {
  Home, Wrench, FileText, BarChart3, Bell, Search, ChevronLeft,
  MapPin, Clock, AlertTriangle, CheckCircle2, Gauge, Calendar,
  TrendingUp, TrendingDown, ChevronRight, DollarSign,
  Activity, ClipboardList, Download, ShieldCheck, User, Mail, Lock,
  Building2, Camera, ArrowRight, Eye, EyeOff, Sparkles, Plus, Paperclip, Edit3
} from "lucide-react";

/* ---------------------------------- TOKENS ---------------------------------- */
const C = {
  bg: "#0A0C0F",
  bgSoft: "#0F1215",
  surface: "#161A1F",
  surfaceElevated: "#1C2129",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.14)",
  ink: "#F2F4F6",
  inkSoft: "#9BA4AE",
  inkFaint: "#5E6771",
  accent: "#E8B93A",
  accentDeep: "#C99A22",
  accentSoft: "rgba(232,185,58,0.14)",
  green: "#33C57C",
  greenSoft: "rgba(51,197,124,0.14)",
  amber: "#F0B429",
  amberSoft: "rgba(240,180,41,0.14)",
  red: "#F0554D",
  redSoft: "rgba(240,85,77,0.14)",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
.bp-display{font-family:'Space Grotesk',sans-serif;}
.bp-body{font-family:'Inter',sans-serif;}
.bp-mono{font-family:'JetBrains Mono',monospace;}
.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
.hide-scrollbar::-webkit-scrollbar{display:none;width:0;height:0;}
`;

const EXCHANGE_RATE = 3.75; // PEN por USD (referencial)

/* --------------------------- VALIDACIÓN Y SEGURIDAD --------------------------- */
/* Convierte texto a número solo si es un número real y finito (rechaza "",
   "Infinity", "NaN", texto no numérico, etc.). Devuelve null si no es válido,
   para diferenciarlo claramente de "el usuario ingresó 0". */
function toFiniteNumber(value, { min = null } = {}) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (min !== null && n < min) return null;
  return n;
}

/* Nombres que, usados como código interno de máquina, podrían interferir con
   el comportamiento de los objetos internos de JavaScript (p. ej. __proto__).
   Se bloquean explícitamente aunque el resto del código ya está protegido
   con Object.create(null) — defensa en profundidad. */
const RESERVED_CODES = ["__proto__", "constructor", "prototype"];

/* ---------------------------------- DATA ---------------------------------- */
const MACHINES = [
  { id: "EXC-001", brand: "CAT", model: "336", type: "Excavadora", empresa: "Minera Volcan", unidad: "Yaul", horometro: 8542, status: "verde", alerts: 0, disponibilidad: 92.4, utilizacion: 84.7, ultimoMant: "12 jul 2026", proxMant: "26 ago 2026" },
  { id: "CF-002", brand: "CAT", model: "950", type: "Cargador Frontal", empresa: "Chinalco", unidad: "Morococha", horometro: 6218, status: "rojo", alerts: 2, disponibilidad: 78.1, utilizacion: 65.3, ultimoMant: "02 jun 2026", proxMant: "vencido" },
  { id: "EXC-003", brand: "Komatsu", model: "PC200", type: "Excavadora", empresa: "Antamina", unidad: "Áncash", horometro: 11032, status: "amarillo", alerts: 1, disponibilidad: 88.0, utilizacion: 79.2, ultimoMant: "20 jul 2026", proxMant: "24 ago 2026" },
  { id: "TR-004", brand: "CAT", model: "D6", type: "Tractor", empresa: "Las Bambas", unidad: "Apurímac", horometro: 15230, status: "verde", alerts: 0, disponibilidad: 95.1, utilizacion: 90.0, ultimoMant: "05 ago 2026", proxMant: "18 sep 2026" },
  { id: "RB-005", brand: "Hitachi", model: "ZX350", type: "Retroexcavadora", empresa: "Cerro Verde", unidad: "Arequipa", horometro: 4521, status: "verde", alerts: 0, disponibilidad: 90.3, utilizacion: 82.0, ultimoMant: "29 jul 2026", proxMant: "02 sep 2026" },
  { id: "CF-006", brand: "CAT", model: "950", type: "Cargador Frontal", empresa: "Minera Volcan", unidad: "Yaul", horometro: 9800, status: "amarillo", alerts: 1, disponibilidad: 85.0, utilizacion: 70.5, ultimoMant: "15 jul 2026", proxMant: "23 ago 2026" },
];

const CONTRACTS = Object.assign(Object.create(null), {
  "EXC-001": { inicio: "01 ene 2026", fin: "31 dic 2026", tarifaSoles: 185, horasFact: 620, cumplimiento: 96, horasContrato: 2000, horasEjecutadas: 1240 },
  "CF-002": { inicio: "15 mar 2025", fin: "14 mar 2027", tarifaSoles: 210, horasFact: 540, cumplimiento: 74, horasContrato: 1800, horasEjecutadas: 1550 },
  "EXC-003": { inicio: "01 jun 2025", fin: "31 may 2027", tarifaSoles: 198, horasFact: 598, cumplimiento: 89, horasContrato: 2200, horasEjecutadas: 1420 },
  "TR-004": { inicio: "10 feb 2026", fin: "09 feb 2028", tarifaSoles: 230, horasFact: 645, cumplimiento: 98, horasContrato: 2400, horasEjecutadas: 1980 },
  "RB-005": { inicio: "01 ago 2025", fin: "31 jul 2027", tarifaSoles: 205, horasFact: 601, cumplimiento: 93, horasContrato: 2000, horasEjecutadas: 1310 },
  "CF-006": { inicio: "20 abr 2026", fin: "19 abr 2028", tarifaSoles: 210, horasFact: 512, cumplimiento: 81, horasContrato: 1900, horasEjecutadas: 1145 },
});

const MAINTENANCE = [
  { machineId: "CF-002", tipo: "Correctivo", componente: "Sistema hidráulico", fecha: "Vencido — 3 días", prioridad: "rojo" },
  { machineId: "EXC-003", tipo: "Preventivo", componente: "Cambio de aceite motor", fecha: "24 ago 2026", prioridad: "amarillo" },
  { machineId: "CF-006", tipo: "Preventivo", componente: "Filtros y lubricación", fecha: "23 ago 2026", prioridad: "amarillo" },
  { machineId: "EXC-001", tipo: "Preventivo", componente: "Inspección de tren de rodaje", fecha: "26 ago 2026", prioridad: "verde" },
  { machineId: "RB-005", tipo: "Preventivo", componente: "Revisión de componentes críticos", fecha: "02 sep 2026", prioridad: "verde" },
  { machineId: "TR-004", tipo: "Preventivo", componente: "Cambio de tren de rodaje", fecha: "18 sep 2026", prioridad: "verde" },
];

const DAY_LABELS = ["Hoy", "Ayer", "Vie", "Jue", "Mié", "Mar", "Lun"];
const STOP_REASONS = ["Falla hidráulica", "Cambio de turno", "Falta de combustible", "Espera de material", "Mantenimiento no programado"];

function buildWeeklyLog(machine) {
  let seed = 0;
  for (let i = 0; i < machine.id.length; i++) seed = (seed * 31 + machine.id.charCodeAt(i)) % 97;
  const bias = machine.status === "rojo" ? 1.6 : machine.status === "amarillo" ? 1.15 : 0.7;
  return DAY_LABELS.map((label, i) => {
    seed = (seed * 53 + i * 17 + 7) % 97;
    let paralizadas = Math.max(0, Math.min(4, Math.round((seed % 5) * bias)));
    if (i === 0 && machine.status === "rojo") paralizadas = Math.max(paralizadas, 2);
    if (i === 0 && machine.status === "verde") paralizadas = Math.min(paralizadas, 1);
    const trabajadas = 10 - paralizadas;
    const paralizaciones = [];
    if (paralizadas > 0) {
      const startHour = 9 + (seed % 5);
      const endHour = Math.min(17, startHour + paralizadas);
      paralizaciones.push({
        inicio: `${String(startHour).padStart(2, "0")}:00`,
        fin: `${String(endHour).padStart(2, "0")}:00`,
        duracion: `${endHour - startHour} h`,
        motivo: STOP_REASONS[seed % STOP_REASONS.length],
        observacion: "Registrado por el operador en turno.",
        accion: "Se notificó al área de mantenimiento para su revisión.",
      });
    }
    return { label, jornadaInicio: "07:00", jornadaFin: "17:00", trabajadas, paralizadas, paralizaciones };
  });
}

const ALERTS = [
  { id: "al1", level: "rojo", machineId: "CF-002", tipo: "falla", texto: "Equipo detenido por falla en sistema hidráulico", tiempo: "Hace 2 h" },
  { id: "al2", level: "rojo", machineId: "CF-002", tipo: "mantenimiento", texto: "El mantenimiento correctivo está vencido hace 3 días", tiempo: "Hoy" },
  { id: "al3", level: "rojo", machineId: "CF-002", tipo: "horas", texto: "Disponibilidad por debajo del mínimo contractual (78.1% vs 85%)", tiempo: "Hace 5 h" },
  { id: "al4", level: "amarillo", machineId: "EXC-003", tipo: "mantenimiento", texto: "Cambio de aceite en aproximadamente 34 h", tiempo: "Hoy" },
  { id: "al5", level: "amarillo", machineId: "CF-006", tipo: "mantenimiento", texto: "Cambio de filtros en aproximadamente 22 h", tiempo: "Hoy" },
  { id: "al6", level: "amarillo", machineId: "EXC-003", tipo: "contrato", texto: "Indicador de utilización acercándose al límite contractual", tiempo: "Ayer" },
  { id: "al7", level: "verde", machineId: "EXC-001", tipo: "mantenimiento", texto: "Mantenimiento completado satisfactoriamente", tiempo: "Ayer" },
  { id: "al8", level: "verde", machineId: "TR-004", tipo: "contrato", texto: "Próxima revisión de contrato estimada: 18/09/2026", tiempo: "Hace 2 días" },
];

const NOTIFICATION_PREVIEWS = [
  { level: "amarillo", titulo: "Mantenimiento próximo", machine: "CAT 336 · EXC-001", mensaje: "Cambio de aceite en aproximadamente 85 h.", accion: "Ver mantenimiento" },
  { level: "rojo", titulo: "Mantenimiento vencido", machine: "CAT 950 · CF-002", mensaje: "El mantenimiento programado se encuentra pendiente.", accion: "Revisar ahora" },
  { level: "verde", titulo: "Mantenimiento programado", machine: "CAT 336 · EXC-001", mensaje: "Próxima revisión estimada: 15/09/2026.", accion: "Ver detalle" },
];

/* Detalle de mantenimiento por máquina — módulo Mantenimiento */
const MAINT_DETAIL = Object.assign(Object.create(null), {
  "EXC-001": {
    estado: "verde",
    ultimo: { tipo: "Preventivo", fecha: "12 jul 2026", horometro: 8210, trabajo: "Cambio de aceite y filtros, inspección de tren de rodaje.", componentes: ["Filtro de aceite", "Filtro de aire"] },
    proximo: { tipo: "Preventivo · 250 h", horasRestantes: 168, fechaEstimada: "26 ago 2026", estado: "verde" },
  },
  "CF-002": {
    estado: "rojo",
    ultimo: { tipo: "Correctivo", fecha: "02 jun 2026", horometro: 5980, trabajo: "Reparación de fuga en sistema hidráulico principal.", componentes: ["Manguera hidráulica", "Sello de cilindro"] },
    proximo: { tipo: "Correctivo urgente", horasRestantes: 0, fechaEstimada: "Vencido — 3 días", estado: "rojo" },
  },
  "EXC-003": {
    estado: "amarillo",
    ultimo: { tipo: "Preventivo", fecha: "20 jul 2026", horometro: 10802, trabajo: "Cambio de aceite de motor y engrase general.", componentes: ["Aceite de motor", "Grasa multipropósito"] },
    proximo: { tipo: "Preventivo · 250 h", horasRestantes: 34, fechaEstimada: "24 ago 2026", estado: "amarillo" },
  },
  "TR-004": {
    estado: "verde",
    ultimo: { tipo: "Preventivo", fecha: "05 ago 2026", horometro: 15040, trabajo: "Revisión de tren de rodaje y ajuste de tensores.", componentes: ["Zapatas", "Rodillos"] },
    proximo: { tipo: "Preventivo · 500 h", horasRestantes: 410, fechaEstimada: "18 sep 2026", estado: "verde" },
  },
  "RB-005": {
    estado: "verde",
    ultimo: { tipo: "Preventivo", fecha: "29 jul 2026", horometro: 4390, trabajo: "Inspección de componentes críticos y cambio de filtros.", componentes: ["Filtro hidráulico"] },
    proximo: { tipo: "Preventivo · 250 h", horasRestantes: 219, fechaEstimada: "02 sep 2026", estado: "verde" },
  },
  "CF-006": {
    estado: "amarillo",
    ultimo: { tipo: "Preventivo", fecha: "15 jul 2026", horometro: 9612, trabajo: "Cambio de filtros y lubricación general.", componentes: ["Filtro de combustible"] },
    proximo: { tipo: "Preventivo · 250 h", horasRestantes: 22, fechaEstimada: "23 ago 2026", estado: "amarillo" },
  },
});

/* Historial compacto de mantenimientos por máquina */
const MAINT_HISTORY = Object.assign(Object.create(null), {
  "EXC-001": [
    { tipo: "Preventivo", fecha: "12 jul 2026", horometro: 8210, trabajo: "Cambio de aceite y filtros", documento: true },
    { tipo: "Preventivo", fecha: "18 abr 2026", horometro: 7460, trabajo: "Inspección de tren de rodaje", documento: true },
    { tipo: "Cambio de componente", fecha: "02 feb 2026", horometro: 6890, trabajo: "Cambio de cuchillas de balde", documento: false },
  ],
  "CF-002": [
    { tipo: "Correctivo", fecha: "02 jun 2026", horometro: 5980, trabajo: "Reparación de fuga hidráulica", documento: true },
    { tipo: "Preventivo", fecha: "10 mar 2026", horometro: 5210, trabajo: "Cambio de aceite y filtros", documento: true },
  ],
  "EXC-003": [
    { tipo: "Preventivo", fecha: "20 jul 2026", horometro: 10802, trabajo: "Cambio de aceite de motor", documento: true },
    { tipo: "Inspección", fecha: "28 abr 2026", horometro: 9950, trabajo: "Inspección general de componentes", documento: false },
  ],
  "TR-004": [
    { tipo: "Preventivo", fecha: "05 ago 2026", horometro: 15040, trabajo: "Revisión de tren de rodaje", documento: true },
    { tipo: "Cambio de componente", fecha: "12 may 2026", horometro: 14100, trabajo: "Cambio de zapatas", documento: true },
  ],
  "RB-005": [
    { tipo: "Preventivo", fecha: "29 jul 2026", horometro: 4390, trabajo: "Inspección de componentes críticos", documento: false },
  ],
  "CF-006": [
    { tipo: "Preventivo", fecha: "15 jul 2026", horometro: 9612, trabajo: "Cambio de filtros y lubricación", documento: true },
    { tipo: "Correctivo", fecha: "22 mar 2026", horometro: 8740, trabajo: "Cambio de manguera hidráulica", documento: true },
  ],
});

/* Mantenimiento predictivo — estructura preparada para una futura iteración.
   Cada estimación de IA confirmada podría registrarse aquí junto con la
   duración real observada, para que BePlanner ajuste progresivamente sus
   próximas estimaciones de vida útil por componente. No tiene lógica activa
   todavía; solo deja la forma del dato lista para conectarse más adelante:
   { maquinaId, componente, estimacionInicialHoras, horasRealesObservadas: [], fuente: "IA" } */
const PREDICTIVE_MAINTENANCE_LOG = [];

/* ---------------------- CONTROL DE HORAS (fuentes externas) ---------------------- */
/* Estructura interna estándar, independiente de marca/fabricante.
   Cada registro representa un periodo de horas importado desde una fuente
   (sistema del fabricante o reporte de la empresa minera), con trazabilidad
   completa de origen. Se guarda en memoria igual que el resto de datos de
   este prototipo (MACHINES, CONTRACTS, etc.). */
const HOUR_RECORDS = [];

/* Alias de nombres de campo usados por distintos fabricantes/plataformas,
   para poder normalizar un CSV real sin depender de una marca específica. */
const FIELD_ALIASES = {
  horometroInicial: ["horometro inicial", "horometro_inicial", "starting hours", "initial hours", "smr inicial", "starting smr"],
  horometroFinal: ["horometro final", "horometro_final", "operating hours", "engine hours", "ending hours", "final hours", "smr", "current hours", "current smr"],
  horasTrabajadas: ["horas trabajadas", "working hours", "hours worked", "run hours", "runtime hours"],
  horasParalizadas: ["horas paralizadas", "downtime", "down time", "idle hours", "stopped hours", "paralizacion"],
  horasTurno: ["horas turno", "horas de turno", "shift hours", "scheduled hours"],
};

/* Parseo real de CSV (sin librerías) + normalización a la estructura interna.
   Toma la primera fila de datos como el periodo importado. Devuelve null si
   el archivo no tiene al menos encabezado + una fila. */
function parseAndNormalizeCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return null;
  const splitter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(splitter).map(h => h.trim().toLowerCase());
  const values = lines[1].split(splitter).map(v => v.trim());
  const result = {};
  Object.entries(FIELD_ALIASES).forEach(([field, aliases]) => {
    const idx = headers.findIndex(h => aliases.some(a => h === a || h.includes(a)));
    if (idx !== -1 && values[idx] !== undefined && values[idx] !== "") {
      const num = parseFloat(values[idx].replace(",", "."));
      if (!isNaN(num)) result[field] = String(num);
    }
  });
  return Object.keys(result).length ? result : null;
}

/* Arquitectura preparada para futuras APIs de fabricante — SIN lógica activa.
   La idea, cuando exista un conector real y autorizado por cada fabricante:
   Fabricante → API → Connector → Normalización (mismas FIELD_ALIASES/forma
   de HOUR_RECORDS de arriba) → BePlanner. No se simula ninguna conexión. */
const EXTERNAL_SOURCE_CONNECTORS = []; // { fabricante, estado: "no_conectado", tipoAuth: null }

const REPORT_TYPES = [
  { id: "diario", nombre: "Reporte diario", desc: "Estado y horas del día", icon: Calendar },
  { id: "semanal", nombre: "Reporte semanal", desc: "Consolidado de la semana", icon: ClipboardList },
  { id: "mensual", nombre: "Reporte mensual", desc: "Cierre mensual de flota", icon: FileText },
  { id: "disponibilidad", nombre: "Disponibilidad", desc: "Por equipo y unidad", icon: Gauge },
  { id: "utilizacion", nombre: "Utilización", desc: "Horas efectivas vs disponibles", icon: Activity },
  { id: "mtbf", nombre: "MTBF", desc: "Tiempo medio entre fallas", icon: TrendingUp },
  { id: "mttr", nombre: "MTTR", desc: "Tiempo medio de reparación", icon: TrendingDown },
  { id: "costos", nombre: "Costos y rentabilidad", desc: "Por equipo y contrato", icon: DollarSign },
];

const PLANS = [
  {
    id: "basico", nombre: "Básico", precio: "Gratis", precioSub: "Siempre",
    features: [
      "Registro de empresa",
      "Gestión básica de maquinaria",
      "Marca, modelo, código, horómetro y ubicación",
      "Estado general de cada máquina",
      "Alertas básicas",
      "Acceso limitado a operación y mantenimiento",
    ],
  },
  {
    id: "normal", nombre: "Normal", precio: "US$ 10", precioSub: "/ mes", destacado: false,
    features: [
      "Todo lo incluido en Básico",
      "Mayor detalle de cada maquinaria",
      "Mantenimiento preventivo y correctivo",
      "Gestión de componentes",
      "Registro de fallas y downtime",
      "Indicadores de disponibilidad y utilización",
      "Historial de maquinaria",
      "Reportes básicos",
    ],
  },
  {
    id: "premium", nombre: "Premium", precio: "US$ 60", precioSub: "/ mes", destacado: true,
    features: [
      "Todo lo incluido en Normal",
      "Gestión completa de flota",
      "Contratos y cumplimiento contractual",
      "MTBF y MTTR",
      "Costos y rentabilidad",
      "Reportes avanzados",
      "Exportación a Excel",
      "Exportación de reportes completos",
      "Mayor almacenamiento e historial",
      "Análisis y seguimiento avanzado",
    ],
  },
];

/* ------------------------------- TYPE ICONS -------------------------------- */
function TypeIcon({ type, size = 22, color = C.accent }) {
  const p = { stroke: color, strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  if (type === "Excavadora") return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="6" y="24" width="20" height="6" rx="1" {...p} />
      <circle cx="10" cy="32" r="3" {...p} />
      <circle cx="22" cy="32" r="3" {...p} />
      <rect x="10" y="16" width="10" height="8" rx="1.5" {...p} />
      <path d="M18 17 L30 10 L34 13 L26 20 Z" {...p} />
      <path d="M34 13 L37 17 L33 20 L30 18" {...p} />
    </svg>
  );
  if (type === "Cargador Frontal") return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="12" y="16" width="16" height="10" rx="1.5" {...p} />
      <circle cx="14" cy="30" r="4" {...p} />
      <circle cx="28" cy="30" r="4" {...p} />
      <path d="M12 22 L4 25 L4 30 L10 30" {...p} />
      <path d="M4 25 L8 21 L11 22" {...p} />
    </svg>
  );
  if (type === "Retroexcavadora") return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="13" y="16" width="14" height="9" rx="1.5" {...p} />
      <circle cx="15" cy="29" r="4" {...p} />
      <circle cx="27" cy="29" r="4" {...p} />
      <path d="M13 20 L6 20 L4 25 L8 27" {...p} />
      <path d="M27 18 L35 12 L38 15 L32 22 L27 21" {...p} />
    </svg>
  );
  return ( // Tractor
    <svg width={size} height={size} viewBox="0 0 40 40">
      <rect x="9" y="17" width="18" height="8" rx="1.5" {...p} />
      <path d="M6 30 h22" {...p} />
      <path d="M6 30 v-6 l4-5 h4" {...p} />
      <path d="M6 24 h6" {...p} />
      <rect x="26" y="14" width="6" height="6" rx="1" {...p} />
    </svg>
  );
}

/* ------------------------------- SMALL PARTS -------------------------------- */
function StatusPill({ status, alerts }) {
  const map = {
    verde: { bg: C.greenSoft, fg: C.green, label: "Todo OK" },
    amarillo: { bg: C.amberSoft, fg: C.amber, label: "Atención" },
    rojo: { bg: C.redSoft, fg: C.red, label: alerts ? `${alerts} alerta${alerts > 1 ? "s" : ""}` : "Crítica" },
  }[status];
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0" style={{ background: map.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.fg, boxShadow: `0 0 6px ${map.fg}` }} />
      <span className="text-xs font-semibold bp-body" style={{ color: map.fg }}>{map.label}</span>
    </div>
  );
}

function Bar({ value, color }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div className="h-1.5 rounded-full" style={{ width: `${value}%`, background: color, boxShadow: `0 0 8px ${color}55` }} />
    </div>
  );
}

function SectionTitle({ children, sub, right }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="bp-display text-[17px] font-semibold" style={{ color: C.ink }}>{children}</h2>
        {sub && <p className="bp-body text-xs mt-0.5" style={{ color: C.inkFaint }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function CurrencyToggle({ currency, setCurrency }) {
  return (
    <div className="flex p-0.5 rounded-full" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
      {["PEN", "USD"].map(cur => (
        <button key={cur} onClick={() => setCurrency(cur)}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bp-body transition-colors"
          style={currency === cur ? { background: C.accent, color: C.bg } : { color: C.inkFaint }}>
          {cur === "PEN" ? "S/" : "US$"}
        </button>
      ))}
    </div>
  );
}

function Card({ children, style, ...rest }) {
  return (
    <div className="rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.35)", ...style }} {...rest}>
      {children}
    </div>
  );
}

function Field({ icon: FieldIcon, error, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: C.surface, border: `1px solid ${error ? C.red : C.border}` }}>
        <FieldIcon size={16} color={C.inkFaint} />
        <input {...props} type={isPassword ? (show ? "text" : "password") : props.type}
          className="bg-transparent outline-none text-sm flex-1 bp-body" style={{ color: C.ink }} />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}>
            {show ? <EyeOff size={15} color={C.inkFaint} /> : <Eye size={15} color={C.inkFaint} />}
          </button>
        )}
      </div>
      {error && <p className="bp-body text-[11px] mt-1" style={{ color: C.red }}>{error}</p>}
    </div>
  );
}

function PrimaryButton({ children, onClick, style, ...rest }) {
  return (
    <button onClick={onClick} {...rest}
      className="w-full py-3.5 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-2"
      style={{ background: C.accent, color: C.bg, boxShadow: `0 8px 20px rgba(232,185,58,0.25)`, ...style }}>
      {children}
    </button>
  );
}

function BpLogo({ size = 40 }) {
  return (
    <div className="rounded-2xl flex items-center justify-center" style={{ width: size, height: size, background: C.accent, boxShadow: `0 10px 26px rgba(232,185,58,0.35)` }}>
      <Gauge size={size * 0.5} color={C.bg} strokeWidth={2.2} />
    </div>
  );
}

/* --------------------------------- AUTH SCREENS --------------------------------- */
function WelcomeScreen({ go }) {
  return (
    <div className="h-full flex flex-col px-6 pt-14 pb-8 hide-scrollbar overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <BpLogo size={64} />
        <p className="bp-display text-2xl font-semibold mt-5" style={{ color: C.ink }}>BePlanner</p>
        <p className="bp-body text-xs mt-2 max-w-[220px]" style={{ color: C.inkFaint }}>
          Control centralizado de tu maquinaria pesada alquilada a operaciones mineras
        </p>
      </div>

      <div className="space-y-3">
        <PrimaryButton onClick={() => go("login")}>
          Iniciar sesión <ArrowRight size={15} />
        </PrimaryButton>
        <button onClick={() => go("signup")} className="w-full py-3.5 rounded-xl text-sm font-semibold bp-body"
          style={{ background: C.surface, color: C.ink, border: `1px solid ${C.borderStrong}` }}>
          Crear cuenta
        </button>

        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: C.border }} />
          <span className="bp-body text-[11px]" style={{ color: C.inkFaint }}>o continuar con</span>
          <div className="flex-1 h-px" style={{ background: C.border }} />
        </div>

        <button className="w-full py-3.5 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-2.5"
          style={{ background: C.surface, color: C.ink, border: `1px solid ${C.border}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.5 12.2c0-.8-.07-1.5-.2-2.2H12v4.3h5.9c-.25 1.3-1 2.4-2.15 3.2v2.6h3.5c2-1.9 3.25-4.6 3.25-7.9z" />
            <path fill="#34A853" d="M12 23c2.9 0 5.35-1 7.15-2.6l-3.5-2.6c-1 .65-2.2 1.05-3.65 1.05-2.8 0-5.15-1.9-6-4.4H2.4v2.7C4.2 20.6 7.8 23 12 23z" />
            <path fill="#FBBC05" d="M6 14.45a6.6 6.6 0 0 1 0-4.9V6.85H2.4a11 11 0 0 0 0 9.9z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3 .55 4.1 1.6l3.1-3.1C17.35 2.1 14.9 1 12 1 7.8 1 4.2 3.4 2.4 6.85l3.6 2.7C6.85 7.05 9.2 5.4 12 5.4z" />
          </svg>
          Continuar con Google
        </button>

        <button onClick={() => go("forgot")} className="w-full text-center pt-2">
          <span className="bp-body text-xs font-medium" style={{ color: C.accent }}>¿Olvidaste tu contraseña?</span>
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ go, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Ingresa un correo válido.";
    if (!password) e.password = "Ingresa tu contraseña.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    onLogin();
  };

  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-8 hide-scrollbar overflow-y-auto">
      <button onClick={() => go("welcome")} className="flex items-center gap-1 mb-6 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <div className="flex items-center gap-3 mb-8">
        <BpLogo size={44} />
        <div>
          <p className="bp-display text-lg font-semibold" style={{ color: C.ink }}>Iniciar sesión</p>
          <p className="bp-body text-xs" style={{ color: C.inkFaint }}>Ingresa con tu cuenta personal</p>
        </div>
      </div>

      <Field icon={Mail} type="email" autoComplete="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
      <Field icon={Lock} type="password" autoComplete="current-password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />

      <button onClick={() => go("forgot")} className="text-right mb-5">
        <span className="bp-body text-xs font-medium" style={{ color: C.accent }}>¿Olvidaste tu contraseña?</span>
      </button>

      <PrimaryButton onClick={handleLogin}>Ingresar <ArrowRight size={15} /></PrimaryButton>


      <p className="bp-body text-xs text-center mt-6" style={{ color: C.inkFaint }}>
        ¿No tienes cuenta?{" "}
        <button onClick={() => go("signup")}>
          <span className="font-semibold" style={{ color: C.accent }}>Crear cuenta</span>
        </button>
      </p>
    </div>
  );
}

function SignupScreen({ go, onSignup }) {
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", empresa: "", ruc: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Ingresa tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) e.correo = "Ingresa un correo válido.";
    if (form.password.length < 6) e.password = "Usa al menos 6 caracteres.";
    if (!form.empresa.trim()) e.empresa = "Ingresa el nombre de tu empresa.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    onSignup(form);
  };

  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-8 hide-scrollbar overflow-y-auto">
      <button onClick={() => go("welcome")} className="flex items-center gap-1 mb-6 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <div className="mb-6">
        <p className="bp-display text-lg font-semibold" style={{ color: C.ink }}>Crear cuenta</p>
        <p className="bp-body text-xs mt-0.5" style={{ color: C.inkFaint }}>Registra tu empresa en BePlanner</p>
      </div>

      <Field icon={User} autoComplete="name" placeholder="Nombre del usuario" value={form.nombre} onChange={set("nombre")} error={errors.nombre} />
      <Field icon={Mail} type="email" autoComplete="email" placeholder="Correo electrónico" value={form.correo} onChange={set("correo")} error={errors.correo} />
      <Field icon={Lock} type="password" autoComplete="new-password" placeholder="Contraseña (mínimo 6 caracteres)" value={form.password} onChange={set("password")} error={errors.password} />
      <Field icon={Building2} autoComplete="organization" placeholder="Nombre de la empresa" value={form.empresa} onChange={set("empresa")} error={errors.empresa} />
      <Field icon={FileText} placeholder="RUC (opcional)" value={form.ruc} onChange={set("ruc")} />

      <PrimaryButton onClick={handleSubmit} style={{ marginTop: 4 }}>Crear cuenta <ArrowRight size={15} /></PrimaryButton>

      <p className="bp-body text-xs text-center mt-6" style={{ color: C.inkFaint }}>
        ¿Ya tienes cuenta?{" "}
        <button onClick={() => go("login")}>
          <span className="font-semibold" style={{ color: C.accent }}>Iniciar sesión</span>
        </button>
      </p>
    </div>
  );
}

function ForgotScreen({ go }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Ingresa un correo válido."); return; }
    setError("");
    setSent(true);
  };

  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-8 hide-scrollbar overflow-y-auto">
      <button onClick={() => go("welcome")} className="flex items-center gap-1 mb-6 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <div className="mb-6">
        <p className="bp-display text-lg font-semibold" style={{ color: C.ink }}>Recuperar contraseña</p>
        <p className="bp-body text-xs mt-0.5" style={{ color: C.inkFaint }}>Te enviaremos un enlace a tu correo</p>
      </div>

      {sent ? (
        <Card style={{ padding: 16 }}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} color={C.green} />
            <p className="bp-body text-xs" style={{ color: C.ink }}>Enlace enviado a <span className="font-semibold">{email || "tu correo"}</span>. Revisa tu bandeja de entrada.</p>
          </div>
        </Card>
      ) : (
        <>
          <Field icon={Mail} type="email" autoComplete="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} error={error} />
          <PrimaryButton onClick={handleSend}>Enviar enlace <ArrowRight size={15} /></PrimaryButton>
        </>
      )}
    </div>
  );
}

/* --------------------------------- ACCOUNT / PLANS --------------------------------- */
function PlanBadge({ plan }) {
  const p = PLANS.find(x => x.id === plan);
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: C.accentSoft }}>
      <Sparkles size={11} color={C.accent} />
      <span className="text-xs font-semibold bp-body" style={{ color: C.accent }}>Plan {p.nombre}</span>
    </div>
  );
}

function AccountScreen({ onBack, account, setAccount, goPlans }) {
  const [form, setForm] = useState(account);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = () => setAccount(form);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <SectionTitle sub="Datos de tu empresa y perfil">Mi cuenta</SectionTitle>

      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: C.accentSoft, border: `1px solid ${C.border}` }}>
              <Building2 size={26} color={C.accent} />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.accent }}>
              <Camera size={12} color={C.bg} />
            </button>
          </div>
          <p className="bp-body text-[11px] mt-2" style={{ color: C.inkFaint }}>Logo de la empresa</p>
        </div>
      </Card>

      <SectionTitle>Empresa</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <Field icon={Building2} placeholder="Nombre de la empresa" value={form.empresa} onChange={set("empresa")} />
        <Field icon={FileText} placeholder="RUC" value={form.ruc} onChange={set("ruc")} />
      </Card>

      <SectionTitle>Usuario</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <Field icon={User} placeholder="Nombre del usuario" value={form.nombre} onChange={set("nombre")} />
        <Field icon={Mail} placeholder="Correo electrónico" value={form.correo} onChange={set("correo")} />
      </Card>

      <SectionTitle>Plan de suscripción</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div className="flex items-center justify-between mb-3">
          <PlanBadge plan={form.plan} />
          <span className="bp-body text-xs" style={{ color: C.inkFaint }}>
            {PLANS.find(p => p.id === form.plan).precio}{form.plan !== "basico" ? PLANS.find(p => p.id === form.plan).precioSub : ""}
          </span>
        </div>
        <button onClick={goPlans} className="w-full py-2.5 rounded-lg text-xs font-semibold bp-body" style={{ background: C.surfaceElevated, color: C.ink, border: `1px solid ${C.border}` }}>
          Cambiar de plan
        </button>
      </Card>

      <PrimaryButton onClick={save}>Guardar cambios</PrimaryButton>
    </div>
  );
}

function PlansScreen({ onBack, account, setAccount }) {
  const [justSelected, setJustSelected] = useState(null);
  const choose = (id) => { setAccount(a => ({ ...a, plan: id })); setJustSelected(id); };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <SectionTitle sub="Elige el plan que mejor se adapte a tu flota">Planes</SectionTitle>

      {justSelected && (
        <Card style={{ padding: 14, marginBottom: 14, background: C.greenSoft, border: `1px solid rgba(51,197,124,0.3)` }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} color={C.green} />
            <p className="bp-body text-xs font-medium" style={{ color: C.green }}>
              Plan {PLANS.find(p => p.id === justSelected).nombre} activado. (Estructura visual — sin pasarela de pago aún)
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {PLANS.map(p => {
          const active = account.plan === p.id;
          return (
            <div key={p.id} className="rounded-2xl p-4" style={{
              background: p.destacado ? `linear-gradient(150deg, ${C.surfaceElevated}, ${C.bgSoft})` : C.surface,
              border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
              boxShadow: p.destacado ? "0 12px 30px rgba(0,0,0,0.45)" : "0 6px 18px rgba(0,0,0,0.3)",
            }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="bp-display text-base font-semibold" style={{ color: C.ink }}>{p.nombre}</p>
                  {p.destacado && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: C.accentSoft, color: C.accent }}>Recomendado</span>
                  )}
                </div>
                {active && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: C.greenSoft, color: C.green }}>Actual</span>}
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="bp-display text-xl font-semibold" style={{ color: C.accent }}>{p.precio}</span>
                <span className="bp-body text-xs" style={{ color: C.inkFaint }}>{p.precioSub}</span>
              </div>
              <div className="space-y-1.5 mb-4">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} color={p.destacado ? C.accent : C.inkSoft} style={{ marginTop: 1.5, flexShrink: 0 }} />
                    <span className="bp-body text-xs" style={{ color: C.inkSoft }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => choose(p.id)} disabled={active}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bp-body"
                style={active
                  ? { background: C.surfaceElevated, color: C.inkFaint, border: `1px solid ${C.border}` }
                  : { background: C.accent, color: C.bg }}>
                {active ? "Plan actual" : "Seleccionar plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------- (screens below unchanged from previous version) -------------------------- */
function MachineCard({ m, onClick }) {
  const statusColor = m.status === "rojo" ? C.red : m.status === "amarillo" ? C.amber : C.green;
  return (
    <button onClick={() => onClick(m)} className="w-full text-left rounded-2xl p-3.5 mb-3 active:scale-[0.98] transition-transform"
      style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 8px 22px rgba(0,0,0,0.35)", borderLeft: `3px solid ${statusColor}` }}>
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
          <TypeIcon type={m.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="bp-display font-semibold text-[15px] truncate" style={{ color: C.ink }}>{m.brand} {m.model}</p>
            <StatusPill status={m.status} alerts={m.alerts} />
          </div>
          <p className="bp-body text-xs mt-0.5" style={{ color: C.inkSoft }}>{m.type} · {m.id}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <MapPin size={12} color={C.inkFaint} />
            <p className="bp-body text-xs" style={{ color: C.inkFaint }}>{m.empresa} – {m.unidad}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: `1px dashed ${C.border}` }}>
        <div className="flex items-center gap-1.5">
          <Gauge size={13} color={C.accent} />
          <span className="bp-mono text-[13px] font-semibold" style={{ color: C.ink }}>{m.horometro.toLocaleString()} h</span>
        </div>
        <div className="flex items-center gap-1 text-xs bp-body font-medium" style={{ color: C.accent }}>
          Ver ficha <ChevronRight size={13} />
        </div>
      </div>
    </button>
  );
}

function InicioScreen({ onOpen, onAddMachine }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("todos");
  const filtered = useMemo(() => MACHINES.filter(m => {
    const matchQ = (m.brand + m.model + m.id + m.empresa + m.unidad).toLowerCase().includes(q.toLowerCase());
    const matchF = filter === "todos" || m.status === filter;
    return matchQ && matchF;
  }), [q, filter]);

  const counts = {
    verde: MACHINES.filter(m => m.status === "verde").length,
    amarillo: MACHINES.filter(m => m.status === "amarillo").length,
    rojo: MACHINES.filter(m => m.status === "rojo").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="bp-display text-xl font-semibold" style={{ color: C.ink }}>Mis Maquinarias</p>
          <p className="bp-body text-xs mt-0.5" style={{ color: C.inkFaint }}>{MACHINES.length} equipos en operación</p>
        </div>
        <button onClick={onAddMachine} className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0" style={{ background: C.accentSoft, border: `1px solid rgba(232,185,58,0.3)` }}>
          <Plus size={14} color={C.accent} />
          <span className="bp-body text-[11.5px] font-semibold" style={{ color: C.accent }}>Agregar</span>
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Search size={16} color={C.inkFaint} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar equipo, código o unidad"
          className="bg-transparent outline-none text-sm flex-1 bp-body" style={{ color: C.ink }} />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        {[
          { key: "todos", label: `Todos (${MACHINES.length})`, color: C.accent },
          { key: "verde", label: `OK (${counts.verde})`, color: C.green },
          { key: "amarillo", label: `Atención (${counts.amarillo})`, color: C.amber },
          { key: "rojo", label: `Crítica (${counts.rojo})`, color: C.red },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bp-body shrink-0"
            style={filter === f.key ? { background: f.color, color: C.bg } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm bp-body mt-10" style={{ color: C.inkFaint }}>No se encontraron equipos.</p>
      ) : filtered.map(m => <MachineCard key={m.id} m={m} onClick={onOpen} />)}
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: last ? 0 : 8 }}>
      <span className="bp-body text-xs" style={{ color: C.inkSoft }}>{label}</span>
      <span className="bp-body text-xs font-semibold" style={{ color: C.ink }}>{value}</span>
    </div>
  );
}

function MachineDetail({ m, onBack, currency, setCurrency, onOpenReporte, onOpenMantenimiento, onAddContract }) {
  const c = CONTRACTS[m.id];
  const pct = c ? Math.min(100, Math.round((c.horasEjecutadas / c.horasContrato) * 100)) : 0;
  const restantes = c ? Math.max(0, c.horasContrato - c.horasEjecutadas) : 0;
  const pctColor = pct >= 95 ? C.red : pct >= 85 ? C.amber : C.accent;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <div className="rounded-2xl p-4 mb-4" style={{ background: `linear-gradient(150deg, ${C.surfaceElevated}, ${C.bgSoft})`, border: `1px solid ${C.borderStrong}`, boxShadow: "0 12px 30px rgba(0,0,0,0.45)" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}` }}>
              <TypeIcon type={m.type} />
            </div>
            <div>
              <p className="bp-display font-semibold text-lg" style={{ color: C.ink }}>{m.brand} {m.model}</p>
              <p className="bp-body text-xs" style={{ color: C.inkFaint }}>{m.type} · {m.id}</p>
            </div>
          </div>
          <StatusPill status={m.status} alerts={m.alerts} />
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <MapPin size={13} color={C.inkFaint} />
          <span className="bp-body text-xs" style={{ color: C.inkSoft }}>{m.empresa} – {m.unidad}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Gauge size={14} color={C.accent} />
          <span className="bp-mono text-xl font-semibold" style={{ color: C.ink }}>{m.horometro.toLocaleString()}</span>
          <span className="bp-body text-xs" style={{ color: C.inkFaint }}>horas</span>
        </div>
      </div>

      {/* Avance del contrato */}
      {c ? (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <p className="bp-body text-xs mb-2" style={{ color: C.inkFaint }}>Avance del contrato</p>
          <p className="bp-mono text-2xl font-semibold mb-3" style={{ color: C.ink }}>
            {c.horasEjecutadas.toLocaleString()} <span style={{ color: C.inkFaint, fontSize: 15 }}>/ {c.horasContrato.toLocaleString()} h</span>
          </p>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pctColor, boxShadow: `0 0 8px ${pctColor}66` }} />
          </div>
          <p className="bp-body text-xs mt-2.5" style={{ color: C.inkSoft }}>
            <span className="font-semibold" style={{ color: pctColor }}>{pct}% ejecutado</span> · {restantes.toLocaleString()} h restantes
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <p className="bp-body text-xs font-semibold mb-1" style={{ color: C.ink }}>Sin contrato registrado</p>
          <p className="bp-body text-xs mb-3" style={{ color: C.inkFaint }}>Esta máquina aún no tiene un contrato asociado.</p>
          <button onClick={onAddContract} className="w-full py-2.5 rounded-lg text-xs font-semibold bp-body flex items-center justify-center gap-1.5" style={{ background: C.accentSoft, color: C.accent }}>
            <Plus size={13} /> Agregar contrato
          </button>
        </Card>
      )}

      {/* Accesos rápidos */}
      <SectionTitle>Accesos rápidos</SectionTitle>
      <button onClick={onOpenReporte} className="w-full text-left rounded-2xl p-3.5 mb-3 flex items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.accentSoft }}>
          <ClipboardList size={18} color={C.accent} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>Reporte diario</p>
          <p className="bp-body text-[11px] mt-0.5" style={{ color: C.inkFaint }}>Registra y consulta la jornada de trabajo</p>
        </div>
        <ChevronRight size={16} color={C.inkFaint} />
      </button>
      <button onClick={onOpenMantenimiento}
        className="w-full text-left rounded-2xl p-3.5 mb-4 flex items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.amberSoft }}>
          <Wrench size={18} color={C.amber} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>Mantenimiento</p>
          <p className="bp-body text-[11px] mt-0.5" style={{ color: C.inkFaint }}>Estado, historial, registro y análisis con IA</p>
        </div>
        <ChevronRight size={16} color={C.inkFaint} />
      </button>

      {c && (
        <>
          <SectionTitle right={<CurrencyToggle currency={currency} setCurrency={setCurrency} />}>Detalle del contrato</SectionTitle>
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Row label="Empresa minera" value={m.empresa} />
            <Row label="Unidad" value={m.unidad} />
            <Row label="Vigencia" value={`${c.inicio} — ${c.fin}`} />
            <Row label="Tarifa" value={currency === "USD" ? `US$ ${(c.tarifaSoles / EXCHANGE_RATE).toFixed(0)} / h` : `S/ ${c.tarifaSoles} / h`} />
            <Row label="Horas facturables (mes)" value={c.horasFact} last />
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px dashed ${C.border}` }}>
              <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Cumplimiento contractual</span>
              <span className="bp-display text-sm font-semibold" style={{ color: c.cumplimiento >= 90 ? C.green : c.cumplimiento >= 80 ? C.amber : C.red }}>{c.cumplimiento}%</span>
            </div>
          </Card>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        {["Componentes", "Fallas", "Operación", "Historial"].map(l => (
          <button key={l} className="rounded-xl py-3 text-sm font-semibold bp-body" style={{ background: C.surfaceElevated, color: C.ink, border: `1px solid ${C.border}` }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- REPORTE DIARIO --------------------------------- */
function DayTimeline({ log, expandedIdx, setExpandedIdx }) {
  const toHour = (t) => Number(t.split(":")[0]);
  const start = toHour(log.jornadaInicio);
  const end = toHour(log.jornadaFin);
  const stops = [...log.paralizaciones].sort((a, b) => toHour(a.inicio) - toHour(b.inicio));
  const segments = [];
  let cursor = start;
  stops.forEach((s) => {
    const sH = toHour(s.inicio), eH = toHour(s.fin);
    if (sH > cursor) segments.push({ type: "work", from: cursor, to: sH });
    segments.push({ type: "stop", from: sH, to: eH, data: s });
    cursor = eH;
  });
  if (cursor < end) segments.push({ type: "work", from: cursor, to: end });
  const span = end - start || 1;

  return (
    <div>
      {/* Barra compacta: hora inicio — segmentos — hora fin */}
      <div className="flex items-center gap-2">
        <span className="bp-mono text-[10px] shrink-0" style={{ color: C.inkFaint }}>{String(start).padStart(2, "0")}:00</span>
        <div className="flex-1 flex gap-0.5 pt-2.5">
          {segments.map((s, i) => {
            const color = s.type === "work" ? C.green : C.amber;
            const isOpen = expandedIdx === i;
            return (
              <div key={i} onClick={() => s.type === "stop" && setExpandedIdx(isOpen ? null : i)}
                className="relative" style={{ width: `${((s.to - s.from) / span) * 100}%` }}>
                {s.type === "stop" && (
                  <span className="absolute rounded-full" style={{ top: -7, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, background: C.amber, boxShadow: `0 0 5px ${C.amber}` }} />
                )}
                <div style={{ height: 9, borderRadius: 5, background: color, boxShadow: isOpen ? `0 0 0 1.5px ${color}` : `0 0 5px ${color}66`, cursor: s.type === "stop" ? "pointer" : "default" }} />
              </div>
            );
          })}
        </div>
        <span className="bp-mono text-[10px] shrink-0" style={{ color: C.inkFaint }}>{String(end).padStart(2, "0")}:00</span>
      </div>

      {/* Leyenda mínima */}
      <div className="flex items-center gap-3 mt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
          <span className="bp-body text-[10px]" style={{ color: C.inkFaint }}>Trabajando</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.amber }} />
          <span className="bp-body text-[10px]" style={{ color: C.inkFaint }}>Pausa · toca para ver detalle</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {segments.filter(s => s.type === "stop").map((s, i) => {
          const idx = segments.indexOf(s);
          const open = expandedIdx === idx;
          return (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <button onClick={() => setExpandedIdx(open ? null : idx)} className="w-full flex items-center justify-between px-3 py-2" style={{ background: C.amberSoft }}>
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={12} color={C.amber} />
                  <span className="bp-body text-[11px] font-semibold truncate" style={{ color: C.amber }}>{s.data.inicio}–{s.data.fin} · {s.data.motivo}</span>
                </div>
                <ChevronRight size={13} color={C.amber} style={{ transform: open ? "rotate(90deg)" : "none", flexShrink: 0 }} />
              </button>
              {open && (
                <div className="px-3.5 py-3" style={{ background: C.surface }}>
                  <Row label="Duración" value={s.data.duracion} />
                  <Row label="Observación" value={s.data.observacion} />
                  <Row label="Acción tomada" value={s.data.accion} last />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReporteDiarioScreen({ m, onBack }) {
  const weekly = useMemo(() => buildWeeklyLog(m), [m.id]);
  const [dayIdx, setDayIdx] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const log = weekly[dayIdx];

  const totalTrabajadas = weekly.reduce((s, d) => s + d.trabajadas, 0);
  const totalParalizadas = weekly.reduce((s, d) => s + d.paralizadas, 0);
  const buenDesempeno = totalParalizadas <= 4;

  const changeDay = (delta) => {
    setExpandedIdx(null);
    setDayIdx(i => Math.max(0, Math.min(weekly.length - 1, i + delta)));
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <div className="mb-4">
        <p className="bp-display text-lg font-semibold" style={{ color: C.ink }}>Reporte diario</p>
        <p className="bp-body text-xs mt-0.5" style={{ color: C.inkFaint }}>{m.brand} {m.model} · {m.id}</p>
      </div>

      {/* Selector de día */}
      <div className="flex items-center justify-between rounded-xl px-2 py-2 mb-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <button onClick={() => changeDay(1)} disabled={dayIdx === weekly.length - 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.surfaceElevated, opacity: dayIdx === weekly.length - 1 ? 0.4 : 1 }}>
          <ChevronLeft size={15} color={C.inkSoft} />
        </button>
        <span className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{log.label}</span>
        <button onClick={() => changeDay(-1)} disabled={dayIdx === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.surfaceElevated, opacity: dayIdx === 0 ? 0.4 : 1 }}>
          <ChevronRight size={15} color={C.inkSoft} />
        </button>
      </div>

      {/* Jornada */}
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <p className="bp-body text-xs mb-1" style={{ color: C.inkFaint }}>Jornada</p>
        <p className="bp-mono text-lg font-semibold" style={{ color: C.ink }}>{log.jornadaInicio} → {log.jornadaFin}</p>
        <p className="bp-body text-[11px] mt-0.5" style={{ color: C.inkFaint }}>10 h de jornada</p>
      </Card>

      {/* Resultado */}
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <p className="bp-body text-xs mb-2.5" style={{ color: C.inkFaint }}>Resultado</p>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Horas trabajadas</span>
          </div>
          <span className="bp-display text-sm font-semibold" style={{ color: C.green }}>{log.trabajadas} h</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: C.amber, boxShadow: `0 0 6px ${C.amber}` }} />
            <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Horas paralizadas</span>
          </div>
          <span className="bp-display text-sm font-semibold" style={{ color: C.amber }}>{log.paralizadas} h</span>
        </div>
      </Card>

      <SectionTitle sub="Toca un tramo naranja para ver el detalle">Línea de tiempo</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <DayTimeline log={log} expandedIdx={expandedIdx} setExpandedIdx={setExpandedIdx} />
      </Card>

      <SectionTitle sub="Toca un día para verlo en detalle">Últimos 7 días</SectionTitle>
      <Card style={{ padding: 6, marginBottom: 12 }}>
        {weekly.map((d, i) => (
          <button key={i} onClick={() => { setDayIdx(i); setExpandedIdx(null); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ background: i === dayIdx ? C.surfaceElevated : "transparent" }}>
            <span className="bp-body text-xs font-medium" style={{ color: i === dayIdx ? C.accent : C.inkSoft }}>{d.label}</span>
            <div className="flex items-center gap-3">
              <span className="bp-mono text-xs" style={{ color: C.green }}>{d.trabajadas} h</span>
              <span className="bp-mono text-xs" style={{ color: C.amber }}>{d.paralizadas} h</span>
            </div>
          </button>
        ))}
        <div className="flex items-center justify-between px-3 py-2.5 mt-1" style={{ borderTop: `1px dashed ${C.border}` }}>
          <span className="bp-body text-[11px] font-semibold" style={{ color: C.inkSoft }}>Total semana</span>
          <span className="bp-body text-[11px] font-semibold" style={{ color: C.ink }}>{totalTrabajadas} h trabajadas · {totalParalizadas} h paralizadas</span>
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 16, background: buenDesempeno ? C.greenSoft : C.amberSoft, border: `1px solid ${buenDesempeno ? "rgba(51,197,124,0.3)" : "rgba(240,180,41,0.3)"}` }}>
        <div className="flex items-start gap-2.5">
          {buenDesempeno ? <CheckCircle2 size={16} color={C.green} style={{ marginTop: 1 }} /> : <AlertTriangle size={16} color={C.amber} style={{ marginTop: 1 }} />}
          <div>
            <p className="bp-body text-xs font-semibold" style={{ color: buenDesempeno ? C.green : C.amber }}>{buenDesempeno ? "Buen desempeño" : "Atención"}</p>
            <p className="bp-body text-xs mt-0.5" style={{ color: C.inkSoft }}>
              {buenDesempeno
                ? `La máquina trabajó ${totalTrabajadas} h esta semana con solo ${totalParalizadas} h de paralización.`
                : `Esta máquina acumuló ${totalParalizadas} h de paralización en los últimos 7 días.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OperacionScreen({ onOpen }) {
  const avgDisp = (MACHINES.reduce((s, m) => s + m.disponibilidad, 0) / MACHINES.length).toFixed(1);
  const avgUtil = (MACHINES.reduce((s, m) => s + m.utilizacion, 0) / MACHINES.length).toFixed(1);
  return (
    <div>
      <SectionTitle sub="Resumen operativo de toda la flota">Operación</SectionTitle>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-3.5" style={{ background: `linear-gradient(150deg, ${C.surfaceElevated}, ${C.bgSoft})`, border: `1px solid ${C.borderStrong}`, boxShadow: "0 8px 22px rgba(0,0,0,0.4)" }}>
          <Gauge size={16} color={C.accent} />
          <p className="bp-display text-xl font-semibold mt-2" style={{ color: C.ink }}>{avgDisp}%</p>
          <p className="bp-body text-[11px]" style={{ color: C.inkFaint }}>Disponibilidad promedio</p>
        </div>
        <Card style={{ padding: 14 }}>
          <Activity size={16} color={C.accent} />
          <p className="bp-display text-xl font-semibold mt-2" style={{ color: C.ink }}>{avgUtil}%</p>
          <p className="bp-body text-[11px]" style={{ color: C.inkFaint }}>Utilización promedio</p>
        </Card>
      </div>

      <SectionTitle>Por equipo</SectionTitle>
      {MACHINES.map(m => (
        <button key={m.id} onClick={() => onOpen(m)} className="w-full text-left rounded-2xl p-3.5 mb-3" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <TypeIcon type={m.type} size={18} />
              <span className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{m.brand} {m.model}</span>
              <span className="bp-body text-xs" style={{ color: C.inkFaint }}>{m.id}</span>
            </div>
            <span className="bp-mono text-xs font-semibold" style={{ color: C.accent }}>{m.horometro.toLocaleString()} h</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between mb-1"><span className="text-[11px] bp-body" style={{ color: C.inkFaint }}>Disponibilidad</span><span className="text-[11px] bp-body font-semibold" style={{ color: C.ink }}>{m.disponibilidad}%</span></div>
              <Bar value={m.disponibilidad} color={C.green} />
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-[11px] bp-body" style={{ color: C.inkFaint }}>Utilización</span><span className="text-[11px] bp-body font-semibold" style={{ color: C.ink }}>{m.utilizacion}%</span></div>
              <Bar value={m.utilizacion} color={C.accent} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type, error }) {
  return (
    <div className="mb-3">
      <label className="bp-body text-[11px] font-medium mb-1 block" style={{ color: C.inkFaint }}>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} type={type || "text"}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm bp-body outline-none"
        style={{ background: C.surface, border: `1px solid ${error ? C.red : C.border}`, color: C.ink }} />
      {error && <p className="bp-body text-[11px] mt-1" style={{ color: C.red }}>{error}</p>}
    </div>
  );
}

const MACHINE_TYPES = ["Excavadora", "Cargador Frontal", "Retroexcavadora", "Bulldozer", "Motoniveladora", "Rodillo", "Camión", "Otro"];

function WizardSteps({ current }) {
  return (
    <div className="flex items-center mb-5">
      {[1, 2, 3].map((n, i) => (
        <React.Fragment key={n}>
          <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 22, height: 22, background: n <= current ? C.accent : C.surfaceElevated, border: `1px solid ${n <= current ? C.accent : C.border}` }}>
            <span className="bp-mono" style={{ fontSize: 10, fontWeight: 700, color: n <= current ? C.bg : C.inkFaint }}>{n}</span>
          </div>
          {i < 2 && <div className="flex-1 h-[1.5px]" style={{ background: n < current ? C.accent : C.border }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function EstadoInicialPicker({ value, onChange }) {
  const opts = [
    { k: "verde", l: "Operativa", c: C.green },
    { k: "amarillo", l: "En mantenimiento", c: C.amber },
    { k: "rojo", l: "Fuera de servicio", c: C.red },
  ];
  return (
    <div className="mb-4">
      <label className="bp-body text-[11px] font-medium mb-1.5 block" style={{ color: C.inkFaint }}>Estado inicial</label>
      <div className="flex gap-2">
        {opts.map(o => {
          const active = value === o.k;
          return (
            <button key={o.k} onClick={() => onChange(o.k)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[10.5px] font-semibold bp-body"
              style={active ? { background: `${o.c}22`, color: o.c, border: `1px solid ${o.c}` } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: o.c }} />
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddMachineWizard({ existingIds, onCancel, onRegistered }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    tipo: "", marca: "", modelo: "", anio: "", codigo: "", serie: "", horometro: "", foto: null,
    empresa: "", unidad: "", status: "verde", turnoInicio: "", turnoFin: "",
    skipContract: false,
    contratoNumero: "", fechaInicio: "", fechaFin: "", horasContrato: "", horasEjecutadas: "0", disponibilidadPactada: "", tarifa: "", documento: null,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const validateStep1 = () => {
    const e = {};
    if (!form.tipo) e.tipo = "Selecciona un tipo de maquinaria.";
    if (!form.marca.trim()) e.marca = "Ingresa la marca.";
    if (!form.modelo.trim()) e.modelo = "Ingresa el modelo.";
    const codigoLimpio = form.codigo.trim();
    if (!codigoLimpio) e.codigo = "Ingresa un código interno.";
    else if (RESERVED_CODES.includes(codigoLimpio.toLowerCase())) e.codigo = "Este código no está permitido, usa otro.";
    else if (existingIds.map(x => x.toLowerCase()).includes(codigoLimpio.toLowerCase())) e.codigo = "Este código ya existe en tu flota.";
    if (toFiniteNumber(form.horometro, { min: 0 }) === null) e.horometro = "Ingresa un horómetro válido.";
    return e;
  };
  const validateStep2 = () => {
    const e = {};
    if (!form.empresa.trim()) e.empresa = "Ingresa el cliente o empresa minera.";
    if (!form.unidad.trim()) e.unidad = "Ingresa el proyecto o ubicación.";
    return e;
  };
  const validateStep3 = () => {
    if (form.skipContract) return {};
    const e = {};
    if (toFiniteNumber(form.horasContrato, { min: 0.01 }) === null) e.horasContrato = "Ingresa las horas contratadas.";
    if (form.fechaInicio && form.fechaFin && new Date(form.fechaFin) < new Date(form.fechaInicio)) e.fechaFin = "La fecha de término no puede ser anterior al inicio.";
    return e;
  };

  const next = () => {
    const e = step === 1 ? validateStep1() : step === 2 ? validateStep2() : validateStep3();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };
  const back = () => (step === 1 ? onCancel() : setStep(s => s - 1));

  const handleConfirm = () => {
    const id = form.codigo.trim().toUpperCase();
    const newMachine = {
      id, brand: form.marca.trim(), model: form.modelo.trim(), type: form.tipo,
      empresa: form.empresa.trim(), unidad: form.unidad.trim(),
      horometro: toFiniteNumber(form.horometro, { min: 0 }) ?? 0,
      status: form.status, alerts: 0,
      disponibilidad: 100, utilizacion: 0,
      ultimoMant: "—", proxMant: "—",
    };
    MACHINES.push(newMachine);
    if (!form.skipContract && toFiniteNumber(form.horasContrato, { min: 0.01 }) !== null) {
      CONTRACTS[id] = {
        inicio: form.fechaInicio || "—", fin: form.fechaFin || "—",
        tarifaSoles: toFiniteNumber(form.tarifa, { min: 0 }) ?? 0, horasFact: 0, cumplimiento: 100,
        horasContrato: toFiniteNumber(form.horasContrato, { min: 0.01 }) ?? 0,
        horasEjecutadas: toFiniteNumber(form.horasEjecutadas, { min: 0 }) ?? 0,
      };
    }
    onRegistered(newMachine);
  };

  return (
    <div>
      <button onClick={back} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> {step === 1 ? "Cancelar" : "Atrás"}
      </button>
      {step <= 3 && <WizardSteps current={step} />}

      {step === 1 && (
        <div>
          <SectionTitle sub="Paso 1 de 3">Identifica tu maquinaria</SectionTitle>
          <label className="bp-body text-[11px] font-medium mb-1.5 block" style={{ color: C.inkFaint }}>Tipo de maquinaria</label>
          <div className="flex flex-wrap gap-2 mb-1">
            {MACHINE_TYPES.map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bp-body"
                style={form.tipo === t ? { background: C.accent, color: C.bg } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
                {t}
              </button>
            ))}
          </div>
          {errors.tipo ? <p className="bp-body text-[11px] mb-3" style={{ color: C.red }}>{errors.tipo}</p> : <div className="mb-3" />}
          <TextField label="Marca" value={form.marca} onChange={set("marca")} error={errors.marca} placeholder="CAT, Komatsu, Hitachi…" />
          <TextField label="Modelo" value={form.modelo} onChange={set("modelo")} error={errors.modelo} placeholder="336" />
          <TextField label="Año (opcional)" value={form.anio} onChange={set("anio")} placeholder="2023" />
          <TextField label="Código interno" value={form.codigo} onChange={set("codigo")} error={errors.codigo} placeholder="EXC-007" />
          <TextField label="Número de serie (opcional)" value={form.serie} onChange={set("serie")} />
          <TextField label="Horómetro actual" type="number" value={form.horometro} onChange={set("horometro")} error={errors.horometro} placeholder="0" />
          <button onClick={() => setForm(f => ({ ...f, foto: f.foto ? null : "foto_maquina.jpg" }))}
            className="w-full rounded-2xl py-6 flex flex-col items-center justify-center gap-2 mb-4"
            style={{ background: C.surface, border: `1.5px dashed ${C.borderStrong}` }}>
            <Camera size={18} color={C.accent} />
            <span className="bp-body text-xs font-medium" style={{ color: C.ink }}>{form.foto || "Fotografía (opcional)"}</span>
          </button>
          <PrimaryButton onClick={next}>Continuar <ArrowRight size={15} color={C.bg} /></PrimaryButton>
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionTitle sub="Paso 2 de 3">¿Dónde trabaja esta máquina?</SectionTitle>
          <TextField label="Cliente / empresa minera" value={form.empresa} onChange={set("empresa")} error={errors.empresa} placeholder="Minera Volcan" />
          <TextField label="Proyecto / unidad / ubicación" value={form.unidad} onChange={set("unidad")} error={errors.unidad} placeholder="Yaul" />
          <EstadoInicialPicker value={form.status} onChange={(v) => setForm(f => ({ ...f, status: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Inicio de turno (opcional)" value={form.turnoInicio} onChange={set("turnoInicio")} placeholder="07:00" />
            <TextField label="Fin de turno (opcional)" value={form.turnoFin} onChange={set("turnoFin")} placeholder="17:00" />
          </div>
          <PrimaryButton onClick={next} style={{ marginTop: 4 }}>Continuar <ArrowRight size={15} color={C.bg} /></PrimaryButton>
        </div>
      )}

      {step === 3 && (
        <div>
          <SectionTitle sub="Paso 3 de 3">Información del contrato</SectionTitle>
          <button onClick={() => setForm(f => ({ ...f, skipContract: !f.skipContract }))}
            className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-4 text-left"
            style={{ background: C.surface, border: `1px solid ${form.skipContract ? C.accent : C.border}` }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${form.skipContract ? C.accent : C.inkFaint}` }}>
              {form.skipContract && <span className="w-2 h-2 rounded-full" style={{ background: C.accent }} />}
            </div>
            <span className="bp-body text-xs font-medium" style={{ color: C.ink }}>Registrar contrato después</span>
          </button>

          {!form.skipContract && (
            <>
              <TextField label="Número de contrato (opcional)" value={form.contratoNumero} onChange={set("contratoNumero")} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={set("fechaInicio")} />
                <TextField label="Fecha de término" type="date" value={form.fechaFin} onChange={set("fechaFin")} error={errors.fechaFin} />
              </div>
              <TextField label="Horas contratadas" type="number" value={form.horasContrato} onChange={set("horasContrato")} error={errors.horasContrato} placeholder="2000" />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Horas ejecutadas iniciales (opcional)" type="number" value={form.horasEjecutadas} onChange={set("horasEjecutadas")} />
                <TextField label="Disp. pactada % (opcional)" type="number" value={form.disponibilidadPactada} onChange={set("disponibilidadPactada")} placeholder="—" />
              </div>
              <TextField label="Tarifa S/ por hora (opcional)" type="number" value={form.tarifa} onChange={set("tarifa")} />
              <button onClick={() => setForm(f => ({ ...f, documento: f.documento ? null : "contrato.pdf" }))}
                className="w-full rounded-2xl py-6 flex flex-col items-center justify-center gap-2 mb-4"
                style={{ background: C.surface, border: `1.5px dashed ${C.borderStrong}` }}>
                <Paperclip size={18} color={C.accent} />
                <span className="bp-body text-xs font-medium" style={{ color: C.ink }}>{form.documento || "Documento del contrato (opcional)"}</span>
              </button>
            </>
          )}
          <PrimaryButton onClick={next}>Revisar <ArrowRight size={15} color={C.bg} /></PrimaryButton>
        </div>
      )}

      {step === 4 && (
        <div>
          <SectionTitle sub="Confirma los datos antes de registrar">Revisa tu maquinaria</SectionTitle>
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
                <TypeIcon type={form.tipo} />
              </div>
              <div>
                <p className="bp-display font-semibold text-[15px]" style={{ color: C.ink }}>{form.marca} {form.modelo} · {form.codigo.toUpperCase()}</p>
                <p className="bp-body text-xs" style={{ color: C.inkFaint }}>{form.tipo}</p>
              </div>
            </div>
            <Row label="Horómetro" value={`${Number(form.horometro).toLocaleString()} h`} />
            <Row label="Ubicación" value={`${form.empresa} · ${form.unidad}`} />
            <Row label="Estado" value={form.status === "verde" ? "Operativa" : form.status === "amarillo" ? "En mantenimiento" : "Fuera de servicio"} last />
          </Card>
          {!form.skipContract ? (
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <Row label="Contrato" value={form.horasContrato ? `${Number(form.horasContrato).toLocaleString()} h` : "—"} />
              {(form.fechaInicio || form.fechaFin) && <Row label="Periodo" value={`${form.fechaInicio || "—"} → ${form.fechaFin || "—"}`} />}
              <Row label="Tarifa" value={form.tarifa ? `S/ ${form.tarifa} / h` : "—"} last />
            </Card>
          ) : (
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <p className="bp-body text-xs" style={{ color: C.inkFaint }}>Sin contrato registrado por ahora. Podrás agregarlo luego desde Contratos o la ficha de la máquina.</p>
            </Card>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body" style={{ background: C.surfaceElevated, color: C.ink, border: `1px solid ${C.border}` }}>
              <ChevronLeft size={14} className="inline" /> Editar
            </button>
            <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-1.5" style={{ background: C.accent, color: C.bg }}>
              <CheckCircle2 size={14} /> Confirmar y registrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddContractScreen({ m, onDone, onCancel }) {
  const [form, setForm] = useState({ contratoNumero: "", fechaInicio: "", fechaFin: "", horasContrato: "", horasEjecutadas: "0", disponibilidadPactada: "", tarifa: "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    const e = {};
    if (toFiniteNumber(form.horasContrato, { min: 0.01 }) === null) e.horasContrato = "Ingresa las horas contratadas.";
    if (form.fechaInicio && form.fechaFin && new Date(form.fechaFin) < new Date(form.fechaInicio)) e.fechaFin = "La fecha de término no puede ser anterior al inicio.";
    if (Object.keys(e).length) { setErrors(e); return; }
    CONTRACTS[m.id] = {
      inicio: form.fechaInicio || "—", fin: form.fechaFin || "—",
      tarifaSoles: toFiniteNumber(form.tarifa, { min: 0 }) ?? 0, horasFact: 0, cumplimiento: 100,
      horasContrato: toFiniteNumber(form.horasContrato, { min: 0.01 }) ?? 0,
      horasEjecutadas: toFiniteNumber(form.horasEjecutadas, { min: 0 }) ?? 0,
    };
    onDone();
  };

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>
      <SectionTitle sub={`${m.brand} ${m.model} · ${m.id}`}>Agregar contrato</SectionTitle>
      <TextField label="Número de contrato (opcional)" value={form.contratoNumero} onChange={set("contratoNumero")} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Fecha de inicio" type="date" value={form.fechaInicio} onChange={set("fechaInicio")} />
        <TextField label="Fecha de término" type="date" value={form.fechaFin} onChange={set("fechaFin")} error={errors.fechaFin} />
      </div>
      <TextField label="Horas contratadas" type="number" value={form.horasContrato} onChange={set("horasContrato")} error={errors.horasContrato} placeholder="2000" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Horas ejecutadas iniciales" type="number" value={form.horasEjecutadas} onChange={set("horasEjecutadas")} />
        <TextField label="Disp. pactada % (opcional)" type="number" value={form.disponibilidadPactada} onChange={set("disponibilidadPactada")} />
      </div>
      <TextField label="Tarifa S/ por hora (opcional)" type="number" value={form.tarifa} onChange={set("tarifa")} />
      <PrimaryButton onClick={save}>Guardar contrato</PrimaryButton>
    </div>
  );
}

function PostRegisterScreen({ m, onViewMachine, onConfigureMaint, onLater }) {
  return (
    <div className="flex flex-col items-center text-center pt-8">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.greenSoft }}>
        <CheckCircle2 size={26} color={C.green} />
      </div>
      <p className="bp-display text-lg font-semibold mb-1" style={{ color: C.ink }}>Maquinaria registrada</p>
      <p className="bp-body text-sm font-medium" style={{ color: C.ink }}>{m.brand} {m.model} · {m.id}</p>
      <p className="bp-body text-xs mb-6" style={{ color: C.inkFaint }}>Ya forma parte de tu flota.</p>

      <div className="w-full text-left mb-6">
        <Card style={{ padding: 14 }}>
          <Row label="Ubicación" value={`${m.empresa} · ${m.unidad}`} />
          <Row label="Horómetro" value={`${m.horometro.toLocaleString()} h`} last />
        </Card>
      </div>

      <div className="w-full space-y-3">
        <PrimaryButton onClick={onViewMachine}>Ver maquinaria</PrimaryButton>
        <button onClick={onConfigureMaint} className="w-full py-3.5 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-2" style={{ background: C.surface, color: C.ink, border: `1px solid ${C.borderStrong}` }}>
          <Wrench size={15} /> Configurar mantenimiento
        </button>
        <button onClick={onLater} className="w-full text-center py-2">
          <span className="bp-body text-xs font-medium" style={{ color: C.inkFaint }}>Más tarde</span>
        </button>
      </div>
    </div>
  );
}

const MAINT_TYPES = ["Preventivo", "Correctivo", "Cambio de componente", "Reparación", "Inspección", "Otro"];

function RegistrarMantenimientoFlow({ onDone, onCancel }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ tipo: "", descripcion: "", fecha: "", horometro: "", componentes: "", repuestos: "", proveedor: "", costo: "", observaciones: "" });
  const [doc, setDoc] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [estimacion, setEstimacion] = useState(null);
  const [editando, setEditando] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const startAnalysis = () => {
    setStep(3);
    setAnalizando(true);
    setTimeout(() => {
      setAnalizando(false);
      setEstimacion({
        componente: form.componentes || "Componente principal intervenido",
        horas: 1000,
        meses: 6,
        confianza: "Media",
        recomendacion: doc ? "El documento sugiere revisión cada 1,000 h o 6 meses, lo que ocurra primero." : "Estimación basada en el tipo de trabajo registrado.",
      });
    }, 1600);
  };

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Cancelar
      </button>

      <div className="flex items-center gap-1.5 mb-5">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex-1 h-1 rounded-full" style={{ background: s <= step ? C.accent : C.border }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <SectionTitle sub="Paso 1 de 3">¿Qué se realizó?</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-4">
            {MAINT_TYPES.map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bp-body"
                style={form.tipo === t ? { background: C.accent, color: C.bg } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
                {t}
              </button>
            ))}
          </div>
          <TextField label="Descripción del trabajo" value={form.descripcion} onChange={set("descripcion")} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Fecha" value={form.fecha} onChange={set("fecha")} placeholder="dd/mm/aaaa" />
            <TextField label="Horómetro" value={form.horometro} onChange={set("horometro")} placeholder="h" />
          </div>
          <TextField label="Componentes intervenidos" value={form.componentes} onChange={set("componentes")} />
          <TextField label="Repuestos utilizados" value={form.repuestos} onChange={set("repuestos")} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Mecánico / proveedor" value={form.proveedor} onChange={set("proveedor")} />
            <TextField label="Costo" value={form.costo} onChange={set("costo")} placeholder="S/" />
          </div>
          <TextField label="Observaciones" value={form.observaciones} onChange={set("observaciones")} />
          <PrimaryButton onClick={() => form.tipo && setStep(2)} style={{ opacity: form.tipo ? 1 : 0.5, marginTop: 4 }}>Continuar</PrimaryButton>
        </div>
      )}

      {step === 2 && (
        <div>
          <SectionTitle sub="Paso 2 de 3">Adjuntar documento</SectionTitle>
          <p className="bp-body text-xs mb-4" style={{ color: C.inkFaint }}>PDF, imagen, orden de trabajo, informe del proveedor o factura relacionada. Podrás verlo luego desde el historial.</p>
          <button onClick={() => setDoc({ name: "orden_trabajo.pdf" })}
            className="w-full rounded-2xl py-8 flex flex-col items-center justify-center gap-2 mb-4"
            style={{ background: C.surface, border: `1.5px dashed ${C.borderStrong}` }}>
            <Paperclip size={20} color={C.accent} />
            <span className="bp-body text-xs font-medium" style={{ color: C.ink }}>{doc ? doc.name : "Toca para adjuntar"}</span>
          </button>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body" style={{ background: C.surfaceElevated, color: C.ink, border: `1px solid ${C.border}` }}>Atrás</button>
            <button onClick={startAnalysis} className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body" style={{ background: C.accent, color: C.bg }}>Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <SectionTitle sub="Paso 3 de 3">Análisis con IA</SectionTitle>
          {analizando ? (
            <Card style={{ padding: 24 }}>
              <div className="flex flex-col items-center text-center gap-3">
                <Sparkles size={22} color={C.accent} />
                <p className="bp-body text-xs font-medium" style={{ color: C.ink }}>IA analizando mantenimiento…</p>
                <p className="bp-body text-[11px]" style={{ color: C.inkFaint }}>Leyendo el documento y comparando con el historial del equipo.</p>
              </div>
            </Card>
          ) : estimacion && (
            <>
              <Card style={{ padding: 16, marginBottom: 12 }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles size={13} color={C.accent} />
                  <span className="bp-body text-[11px] font-semibold" style={{ color: C.accent }}>ESTIMACIÓN DE IA</span>
                </div>
                <Row label="Componente" value={estimacion.componente} />
                <Row label="Vida útil estimada" value={`≈ ${estimacion.horas.toLocaleString()} h ó ${estimacion.meses} meses`} />
                <Row label="Confianza" value={estimacion.confianza} last />
                <p className="bp-body text-[11px] mt-3 pt-3" style={{ color: C.inkFaint, borderTop: `1px dashed ${C.border}` }}>
                  {estimacion.recomendacion} La vida útil puede variar según intensidad de trabajo, condiciones de operación y fabricante.
                </p>
              </Card>
              {editando && (
                <Card style={{ padding: 16, marginBottom: 12 }}>
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Horas" value={String(estimacion.horas)} onChange={e => setEstimacion(v => ({ ...v, horas: Number(e.target.value) || 0 }))} />
                    <TextField label="Meses" value={String(estimacion.meses)} onChange={e => setEstimacion(v => ({ ...v, meses: Number(e.target.value) || 0 }))} />
                  </div>
                </Card>
              )}
              <div className="flex gap-3">
                <button onClick={() => setEditando(e => !e)} className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-1.5" style={{ background: C.surfaceElevated, color: C.ink, border: `1px solid ${C.border}` }}>
                  <Edit3 size={14} /> Editar
                </button>
                <button onClick={() => onDone({ ...form, documento: !!doc, fecha: form.fecha || "Hoy" }, estimacion)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-1.5" style={{ background: C.accent, color: C.bg }}>
                  <CheckCircle2 size={14} /> Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MachineMaintenanceScreen({ m, onBack }) {
  const detail = MAINT_DETAIL[m.id] || { estado: "verde", ultimo: null, proximo: null };
  const [historial, setHistorial] = useState(MAINT_HISTORY[m.id] || []);
  const [proximo, setProximo] = useState(detail.proximo);
  const [flowOpen, setFlowOpen] = useState(false);

  const estadoMap = {
    verde: { label: "Mantenimiento al día", color: C.green, bg: C.greenSoft },
    amarillo: { label: "Mantenimiento próximo", color: C.amber, bg: C.amberSoft },
    rojo: { label: "Mantenimiento vencido", color: C.red, bg: C.redSoft },
  }[detail.estado];

  if (flowOpen) {
    return (
      <RegistrarMantenimientoFlow
        onCancel={() => setFlowOpen(false)}
        onDone={(registro, estimacion) => {
          setHistorial(h => [{ tipo: registro.tipo, fecha: registro.fecha, horometro: Number(registro.horometro) || m.horometro, trabajo: registro.descripcion || "—", documento: !!registro.documento }, ...h]);
          if (estimacion) {
            setProximo({ tipo: `Preventivo · ${estimacion.horas.toLocaleString()} h`, horasRestantes: estimacion.horas, fechaEstimada: `≈ ${estimacion.meses} meses`, estado: "verde" });
          }
          setFlowOpen(false);
        }}
      />
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>

      <SectionTitle sub={`${m.brand} ${m.model} · ${m.id}`}>Mantenimiento</SectionTitle>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 w-fit" style={{ background: estadoMap.bg }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: estadoMap.color, boxShadow: `0 0 6px ${estadoMap.color}` }} />
        <span className="bp-body text-xs font-semibold" style={{ color: estadoMap.color }}>{estadoMap.label}</span>
      </div>

      <SectionTitle>Último mantenimiento</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        {detail.ultimo ? (
          <>
            <Row label="Tipo" value={detail.ultimo.tipo} />
            <Row label="Fecha" value={detail.ultimo.fecha} />
            <Row label="Horómetro" value={`${detail.ultimo.horometro.toLocaleString()} h`} last />
            <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${C.border}` }}>
              <p className="bp-body text-xs mb-2" style={{ color: C.inkSoft }}>{detail.ultimo.trabajo}</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.ultimo.componentes.map((comp, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: C.bgSoft, color: C.inkFaint, border: `1px solid ${C.border}` }}>{comp}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="bp-body text-xs" style={{ color: C.inkFaint }}>Aún no se ha registrado un mantenimiento para este equipo.</p>
        )}
      </Card>

      <SectionTitle>Próximo mantenimiento</SectionTitle>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        {proximo ? (
          <>
            <Row label="Tipo" value={proximo.tipo} />
            <Row label="Horas restantes" value={proximo.horasRestantes > 0 ? `${proximo.horasRestantes.toLocaleString()} h` : "Vencido"} />
            <Row label="Fecha estimada" value={proximo.fechaEstimada} last />
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px dashed ${C.border}` }}>
              <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Estado</span>
              <span className="bp-display text-xs font-semibold" style={{ color: proximo.estado === "rojo" ? C.red : proximo.estado === "amarillo" ? C.amber : C.green }}>
                {proximo.estado === "rojo" ? "Vencido" : proximo.estado === "amarillo" ? "Próximo" : "Programado"}
              </span>
            </div>
          </>
        ) : (
          <p className="bp-body text-xs" style={{ color: C.inkFaint }}>Aún no hay un próximo mantenimiento programado. Regístralo para que BePlanner lo programe automáticamente.</p>
        )}
      </Card>

      <button onClick={() => setFlowOpen(true)}
        className="w-full py-3.5 rounded-xl text-sm font-semibold bp-body flex items-center justify-center gap-2 mb-5"
        style={{ background: C.accent, color: C.bg, boxShadow: `0 8px 20px rgba(232,185,58,0.25)` }}>
        <Plus size={16} /> Registrar mantenimiento
      </button>

      <SectionTitle sub={`${historial.length} registros`}>Historial</SectionTitle>
      {historial.map((h, i) => (
        <Card key={i} style={{ padding: 14, marginBottom: 10 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{h.tipo}</span>
            <span className="bp-body text-[11px]" style={{ color: C.inkFaint }}>{h.fecha}</span>
          </div>
          <p className="bp-body text-xs" style={{ color: C.inkSoft }}>{h.trabajo}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="bp-mono text-[11px]" style={{ color: C.inkFaint }}>{h.horometro.toLocaleString()} h</span>
            {h.documento && (
              <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: C.accent }}>
                <Paperclip size={11} /> Documento
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function MantenimientoScreen({ focusMachine, onSelectMachine, onBackFromDetail }) {
  if (focusMachine) {
    return <MachineMaintenanceScreen m={focusMachine} onBack={onBackFromDetail || (() => onSelectMachine(null))} />;
  }
  return (
    <div>
      <SectionTitle sub="Selecciona una máquina para ver su mantenimiento">Mantenimiento de flota</SectionTitle>
      {MACHINES.map(m => {
        const d = MAINT_DETAIL[m.id];
        const map = {
          verde: { label: "Al día", color: C.green, bg: C.greenSoft },
          amarillo: { label: "Próximo", color: C.amber, bg: C.amberSoft },
          rojo: { label: "Vencido", color: C.red, bg: C.redSoft },
        }[d.estado];
        return (
          <button key={m.id} onClick={() => onSelectMachine(m)} className="w-full text-left rounded-2xl p-3.5 mb-3 flex items-center gap-3" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.bgSoft, border: `1px solid ${C.border}` }}>
              <TypeIcon type={m.type} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{m.brand} {m.model} · {m.id}</p>
              <p className="bp-body text-[11px]" style={{ color: C.inkFaint }}>{m.type} · {m.empresa} – {m.unidad}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0" style={{ background: map.bg }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.color, boxShadow: `0 0 6px ${map.color}` }} />
              <span className="text-[11px] font-semibold bp-body" style={{ color: map.color }}>{map.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ContratosScreen({ onOpen, currency, setCurrency, onAddContract }) {
  return (
    <div>
      <SectionTitle sub="Vigencia y cumplimiento por equipo" right={<CurrencyToggle currency={currency} setCurrency={setCurrency} />}>Contratos</SectionTitle>
      {MACHINES.map(m => {
        const c = CONTRACTS[m.id];
        if (!c) {
          return (
            <div key={m.id} className="w-full rounded-2xl p-3.5 mb-3" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} color={C.inkFaint} />
                  <span className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{m.empresa} – {m.unidad}</span>
                </div>
                <span className="bp-body text-[11px]" style={{ color: C.inkFaint }}>{m.id}</span>
              </div>
              <p className="bp-body text-xs mb-3" style={{ color: C.inkFaint }}>Sin contrato registrado</p>
              <button onClick={() => onAddContract(m)} className="w-full py-2 rounded-lg text-xs font-semibold bp-body flex items-center justify-center gap-1.5" style={{ background: C.accentSoft, color: C.accent }}>
                <Plus size={12} /> Agregar contrato
              </button>
            </div>
          );
        }
        const color = c.cumplimiento >= 90 ? C.green : c.cumplimiento >= 80 ? C.amber : C.red;
        return (
          <button key={m.id} onClick={() => onOpen(m)} className="w-full text-left rounded-2xl p-3.5 mb-3" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} color={C.accent} />
                <span className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{m.empresa} – {m.unidad}</span>
              </div>
              <span className="bp-body text-[11px]" style={{ color: C.inkFaint }}>{m.id}</span>
            </div>
            <Row label="Vigencia" value={`${c.inicio} — ${c.fin}`} />
            <Row label="Tarifa" value={currency === "USD" ? `US$ ${(c.tarifaSoles / EXCHANGE_RATE).toFixed(0)} / h` : `S/ ${c.tarifaSoles} / h`} />
            <Row label="Horas facturables" value={c.horasFact} last />
            <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: `1px dashed ${C.border}` }}>
              <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Cumplimiento</span>
              <div className="flex items-center gap-2 w-1/2">
                <Bar value={c.cumplimiento} color={color} />
                <span className="bp-display text-xs font-semibold" style={{ color }}>{c.cumplimiento}%</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ImportDataScreen({ onCancel, onDone }) {
  const [form, setForm] = useState({
    machineId: "", tipo: "fabricante", fuente: "", periodo: "",
    horometroInicial: "", horometroFinal: "", horasTrabajadas: "", horasParalizadas: "", horasTurno: "",
    archivoNombre: "", formatoOrigen: "",
  });
  const [autoFilled, setAutoFilled] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB — suficiente para un CSV/registro de horas, evita bloquear el navegador

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors(er => ({ ...er, archivo: "El archivo es demasiado grande (máx. 3 MB). Exporta un periodo más corto." }));
      e.target.value = "";
      return;
    }
    setErrors(er => ({ ...er, archivo: undefined }));
    const ext = file.name.split(".").pop().toLowerCase();
    setForm(f => ({ ...f, archivoNombre: file.name, formatoOrigen: ext }));
    setAutoFilled(false);
    if (ext === "csv") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const parsed = parseAndNormalizeCSV(String(evt.target.result || ""));
        if (parsed) {
          setForm(f => ({ ...f, ...parsed }));
          setAutoFilled(true);
        }
      };
      reader.readAsText(file);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.machineId) e.machineId = "Selecciona una máquina.";
    if (!form.fuente.trim()) e.fuente = "Indica la fuente, ej. Cat MineStar o Reporte Minera Volcan.";
    if (!form.periodo.trim()) e.periodo = "Indica el periodo, ej. Agosto 2026.";
    return e;
  };

  const confirm = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const record = {
      id: `HR-${Date.now()}`,
      machineId: form.machineId,
      tipo: form.tipo,
      fuente: form.fuente.trim(),
      periodo: form.periodo.trim(),
      horometroInicial: toFiniteNumber(form.horometroInicial, { min: 0 }),
      horometroFinal: toFiniteNumber(form.horometroFinal, { min: 0 }),
      horasTrabajadas: toFiniteNumber(form.horasTrabajadas, { min: 0 }),
      horasParalizadas: toFiniteNumber(form.horasParalizadas, { min: 0 }),
      horasTurno: toFiniteNumber(form.horasTurno, { min: 0 }),
      fechaImportacion: "Hoy",
      archivoId: form.archivoNombre || null,
      formatoOrigen: form.formatoOrigen || "manual",
    };
    HOUR_RECORDS.push(record);
    onDone(record);
  };


  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>
      <SectionTitle sub="Excel, CSV o PDF · normalizado a la estructura de BePlanner">Importar datos</SectionTitle>

      <label className="bp-body text-[11px] font-medium mb-1.5 block" style={{ color: C.inkFaint }}>Máquina</label>
      <div className="flex flex-wrap gap-2 mb-1">
        {MACHINES.map(m => (
          <button key={m.id} onClick={() => setForm(f => ({ ...f, machineId: m.id }))}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bp-body"
            style={form.machineId === m.id ? { background: C.accent, color: C.bg } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
            {m.brand} {m.model} · {m.id}
          </button>
        ))}
      </div>
      {errors.machineId ? <p className="bp-body text-[11px] mb-3" style={{ color: C.red }}>{errors.machineId}</p> : <div className="mb-3" />}

      <label className="bp-body text-[11px] font-medium mb-1.5 block" style={{ color: C.inkFaint }}>Fuente de los datos</label>
      <div className="flex gap-2 mb-3">
        {[{ k: "fabricante", l: "Sistema del fabricante" }, { k: "empresa", l: "Reporte de la empresa" }].map(o => (
          <button key={o.k} onClick={() => setForm(f => ({ ...f, tipo: o.k }))}
            className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold bp-body"
            style={form.tipo === o.k ? { background: C.accentSoft, color: C.accent, border: `1px solid ${C.accent}` } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
            {o.l}
          </button>
        ))}
      </div>
      <TextField label="Nombre de la fuente" value={form.fuente} onChange={set("fuente")} error={errors.fuente} placeholder={form.tipo === "fabricante" ? "Cat MineStar, Modular DISPATCH…" : "Reporte Minera Volcan"} />
      <TextField label="Periodo" value={form.periodo} onChange={set("periodo")} error={errors.periodo} placeholder="Agosto 2026" />

      <label className="bp-body text-[11px] font-medium mt-1 mb-1.5 block" style={{ color: C.inkFaint }}>Archivo</label>
      <label className="w-full rounded-2xl py-6 flex flex-col items-center justify-center gap-2 mb-2 cursor-pointer"
        style={{ background: C.surface, border: `1.5px dashed ${C.borderStrong}` }}>
        <Download size={18} color={C.accent} />
        <span className="bp-body text-xs font-medium" style={{ color: C.ink }}>{form.archivoNombre || "Toca para adjuntar (.csv, .xlsx, .pdf)"}</span>
        <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFile} className="hidden" />
      </label>
      {errors.archivo && <p className="bp-body text-[11px] mb-3" style={{ color: C.red }}>{errors.archivo}</p>}
      {autoFilled && (
        <p className="bp-body text-[11px] mb-3 flex items-center gap-1.5" style={{ color: C.green }}>
          <CheckCircle2 size={12} /> Datos leídos del CSV. Verifica los campos antes de registrar.
        </p>
      )}
      {form.formatoOrigen && form.formatoOrigen !== "csv" && (
        <p className="bp-body text-[11px] mb-3" style={{ color: C.inkFaint }}>
          Este formato aún no se lee automáticamente. Completa los campos de abajo con lo que indique el archivo.
        </p>
      )}

      <SectionTitle sub="Revisa o completa antes de guardar">Datos normalizados</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Horómetro inicial" type="number" value={form.horometroInicial} onChange={set("horometroInicial")} />
        <TextField label="Horómetro final" type="number" value={form.horometroFinal} onChange={set("horometroFinal")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Horas trabajadas" type="number" value={form.horasTrabajadas} onChange={set("horasTrabajadas")} />
        <TextField label="Horas paralizadas" type="number" value={form.horasParalizadas} onChange={set("horasParalizadas")} />
      </div>
      <TextField label="Horas de turno (opcional)" type="number" value={form.horasTurno} onChange={set("horasTurno")} />

      <PrimaryButton onClick={confirm} style={{ marginTop: 4 }}>Registrar importación</PrimaryButton>
    </div>
  );
}

function CompareHoursScreen({ onCancel, onGoImport }) {
  const [machineId, setMachineId] = useState("");
  const [tarifaOverride, setTarifaOverride] = useState("");
  const machine = MACHINES.find(m => m.id === machineId);
  const records = HOUR_RECORDS.filter(r => r.machineId === machineId);
  const fabricante = [...records].reverse().find(r => r.tipo === "fabricante");
  const empresa = [...records].reverse().find(r => r.tipo === "empresa");

  const num = (v) => (typeof v === "number" ? v : 0);
  const diff = fabricante && empresa ? {
    horasTrabajadas: num(fabricante.horasTrabajadas) - num(empresa.horasTrabajadas),
    horasParalizadas: num(fabricante.horasParalizadas) - num(empresa.horasParalizadas),
    horometroFinal: num(fabricante.horometroFinal) - num(empresa.horometroFinal),
  } : null;
  const THRESHOLD = 0.5;
  const hayDiferencia = diff && (Math.abs(diff.horasTrabajadas) > THRESHOLD || Math.abs(diff.horometroFinal) > THRESHOLD);

  const contractRate = CONTRACTS[machineId]?.tarifaSoles || 0;
  const rate = toFiniteNumber(tarifaOverride, { min: 0 }) ?? contractRate;
  const impacto = diff ? Math.abs(diff.horasTrabajadas) * (rate || 0) : 0;

  const fmtDiff = (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)} h`;

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-1 mb-4 text-sm font-medium bp-body" style={{ color: C.accent }}>
        <ChevronLeft size={16} /> Atrás
      </button>
      <SectionTitle sub="BePlanner vs. reporte de la empresa minera">Comparar horas</SectionTitle>

      <div className="flex flex-wrap gap-2 mb-4">
        {MACHINES.map(m => (
          <button key={m.id} onClick={() => setMachineId(m.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bp-body"
            style={machineId === m.id ? { background: C.accent, color: C.bg } : { background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>
            {m.brand} {m.model} · {m.id}
          </button>
        ))}
      </div>

      {!machineId ? (
        <p className="bp-body text-xs" style={{ color: C.inkFaint }}>Selecciona una máquina para comparar.</p>
      ) : !fabricante || !empresa ? (
        <Card style={{ padding: 16 }}>
          <p className="bp-body text-xs mb-3" style={{ color: C.inkFaint }}>
            Aún no tienes datos suficientes para comparar esta máquina. Importa datos del <strong>sistema del fabricante</strong> y del <strong>reporte de la empresa</strong> para el mismo periodo.
          </p>
          <button onClick={onGoImport} className="w-full py-2.5 rounded-lg text-xs font-semibold bp-body" style={{ background: C.accentSoft, color: C.accent }}>
            Ir a Importar datos
          </button>
        </Card>
      ) : (
        <>
          <p className="bp-body text-xs font-semibold mb-3" style={{ color: C.ink }}>{machine.brand} {machine.model} · {machine.id} · {fabricante.periodo}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card style={{ padding: 14 }}>
              <p className="bp-body text-[10.5px] font-semibold mb-2" style={{ color: C.accent }}>BEPLANNER</p>
              <Row label="Trabajadas" value={`${num(fabricante.horasTrabajadas).toFixed(1)} h`} />
              <Row label="Paralizadas" value={`${num(fabricante.horasParalizadas).toFixed(1)} h`} />
              <Row label="Horómetro" value={`${num(fabricante.horometroFinal).toLocaleString()} h`} last />
            </Card>
            <Card style={{ padding: 14 }}>
              <p className="bp-body text-[10.5px] font-semibold mb-2" style={{ color: C.inkSoft }}>REPORTE EMPRESA</p>
              <Row label="Trabajadas" value={`${num(empresa.horasTrabajadas).toFixed(1)} h`} />
              <Row label="Paralizadas" value={`${num(empresa.horasParalizadas).toFixed(1)} h`} />
              <Row label="Horómetro" value={`${num(empresa.horometroFinal).toLocaleString()} h`} last />
            </Card>
          </div>

          <Card style={{ padding: 16, marginBottom: 16, background: hayDiferencia ? C.redSoft : C.greenSoft, border: `1px solid ${hayDiferencia ? "rgba(240,85,77,0.3)" : "rgba(51,197,124,0.3)"}` }}>
            <div className="flex items-center gap-2 mb-2">
              {hayDiferencia ? <AlertTriangle size={15} color={C.red} /> : <CheckCircle2 size={15} color={C.green} />}
              <span className="bp-body text-xs font-semibold" style={{ color: hayDiferencia ? C.red : C.green }}>
                {hayDiferencia ? "Diferencia detectada" : "Sin diferencias relevantes"}
              </span>
            </div>
            <Row label="Horas trabajadas" value={fmtDiff(diff.horasTrabajadas)} />
            <Row label="Horómetro" value={fmtDiff(diff.horometroFinal)} last />
            {hayDiferencia && (
              <p className="bp-body text-[11px] mt-2.5 pt-2.5" style={{ color: C.inkSoft, borderTop: `1px dashed ${C.border}` }}>
                ⚠️ Requiere revisión. Verifica el reporte con la empresa minera antes de sacar conclusiones.
              </p>
            )}
          </Card>

          {hayDiferencia && (
            <>
              <SectionTitle sub="Solo referencial — no es un monto facturable automáticamente">Impacto económico</SectionTitle>
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <TextField label={`Tarifa S/ por hora ${contractRate ? `(contrato: S/ ${contractRate})` : ""}`} type="number" value={tarifaOverride} onChange={(e) => setTarifaOverride(e.target.value)} placeholder={String(contractRate || "0")} />
                <div className="flex items-center justify-between mt-1 pt-3" style={{ borderTop: `1px dashed ${C.border}` }}>
                  <span className="bp-body text-xs" style={{ color: C.inkSoft }}>Impacto económico referencial</span>
                  <span className="bp-display text-sm font-semibold" style={{ color: C.accent }}>S/ {impacto.toFixed(0)}</span>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}


function ReportesScreen() {
  const [generated, setGenerated] = useState({});
  const [sub, setSub] = useState(null); // null | 'import' | 'compare'

  if (sub === "import") {
    return <ImportDataScreen onCancel={() => setSub(null)} onDone={() => setSub(null)} />;
  }
  if (sub === "compare") {
    return <CompareHoursScreen onCancel={() => setSub(null)} onGoImport={() => setSub("import")} />;
  }

  return (
    <div>
      <SectionTitle sub="Genera reportes consolidados de la flota">Reportes</SectionTitle>

      <SectionTitle sub="Trae tus horas y concíliadas con la empresa minera">Control de horas</SectionTitle>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button onClick={() => setSub("import")} className="text-left rounded-2xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ background: C.accentSoft }}>
            <Download size={16} color={C.accent} />
          </div>
          <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>Importar datos</p>
          <p className="bp-body text-[11px] mt-0.5" style={{ color: C.inkFaint }}>Excel, CSV o PDF por máquina</p>
        </button>
        <button onClick={() => setSub("compare")} className="text-left rounded-2xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ background: C.accentSoft }}>
            <BarChart3 size={16} color={C.accent} />
          </div>
          <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>Comparar horas</p>
          <p className="bp-body text-[11px] mt-0.5" style={{ color: C.inkFaint }}>BePlanner vs. reporte empresa</p>
        </button>
      </div>

      <SectionTitle>Reportes generales</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {REPORT_TYPES.map(r => {
          const Icon = r.icon;
          const done = generated[r.id];
          return (
            <Card key={r.id} style={{ padding: 14 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ background: C.accentSoft }}>
                <Icon size={16} color={C.accent} />
              </div>
              <p className="bp-display text-sm font-semibold" style={{ color: C.ink }}>{r.nombre}</p>
              <p className="bp-body text-[11px] mt-0.5 mb-3" style={{ color: C.inkFaint }}>{r.desc}</p>
              <button onClick={() => setGenerated(g => ({ ...g, [r.id]: true }))}
                className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bp-body"
                style={done ? { background: C.greenSoft, color: C.green } : { background: C.accent, color: C.bg }}>
                {done ? <><CheckCircle2 size={13} /> Generado</> : <><Download size={13} /> Generar</>}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function NotificationPreviewCard({ n }) {
  const map = {
    verde: { color: C.green, label: "Información" },
    amarillo: { color: C.amber, label: "Atención" },
    rojo: { color: C.red, label: "Crítica" },
  }[n.level];
  return (
    <div className="rounded-2xl p-3.5 mb-3 relative" style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}>
      <span className="absolute top-3 right-3 text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: C.bgSoft, color: C.inkFaint, border: `1px solid ${C.border}` }}>VISTA PREVIA</span>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.accent }}>
          <Bell size={12} color={C.bg} />
        </div>
        <span className="bp-body text-xs font-semibold" style={{ color: C.ink }}>BePlanner</span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.color, boxShadow: `0 0 6px ${map.color}` }} />
        <span className="bp-body text-[11px] font-semibold" style={{ color: map.color }}>{n.titulo}</span>
      </div>
      <p className="bp-body text-xs font-medium mb-0.5" style={{ color: C.ink }}>{n.machine}</p>
      <p className="bp-body text-xs mb-3" style={{ color: C.inkSoft }}>{n.mensaje}</p>
      <div className="inline-flex px-3 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: C.surfaceElevated, color: C.accent, border: `1px solid ${C.border}` }}>
        {n.accion}
      </div>
    </div>
  );
}

function AlertasScreen({ onNavigate }) {
  const byMachine = id => MACHINES.find(m => m.id === id);
  const [reviewed, setReviewed] = useState(() => new Set());
  const toggleReviewed = (id, e) => {
    e.stopPropagation();
    setReviewed(r => { const n = new Set(r); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const tipoLabel = { mantenimiento: "Mantenimiento", contrato: "Contrato", horas: "Horas", falla: "Falla" };
  const groups = [
    { key: "rojo", label: "Críticas", color: C.red, soft: C.redSoft, icon: AlertTriangle },
    { key: "amarillo", label: "Requieren atención", color: C.amber, soft: C.amberSoft, icon: Clock },
    { key: "verde", label: "Información", color: C.green, soft: C.greenSoft, icon: CheckCircle2 },
  ];
  return (
    <div>
      <SectionTitle sub={`${ALERTS.length} notificaciones activas`}>Alertas</SectionTitle>
      {groups.map(g => {
        const items = ALERTS.filter(a => a.level === g.key);
        if (items.length === 0) return null;
        const Icon = g.icon;
        return (
          <div key={g.key} className="mb-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }} />
              <span className="bp-body text-xs font-semibold" style={{ color: g.color }}>{g.label.toUpperCase()} ({items.length})</span>
            </div>
            {items.map((a) => {
              const m = byMachine(a.machineId);
              const isReviewed = reviewed.has(a.id);
              return (
                <div key={a.id} role="button" tabIndex={0} onClick={() => onNavigate(a)}
                  className="w-full text-left rounded-2xl p-3.5 mb-2.5 cursor-pointer"
                  style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 6px 18px rgba(0,0,0,0.3)", opacity: isReviewed ? 0.55 : 1 }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: g.soft }}>
                      <Icon size={14} color={g.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded" style={{ background: C.bgSoft, color: C.inkFaint }}>{tipoLabel[a.tipo] || "General"}</span>
                        {isReviewed && <span className="text-[9.5px] font-semibold" style={{ color: C.inkFaint }}>· Revisada</span>}
                      </div>
                      <p className="bp-body text-xs" style={{ color: C.ink }}>{a.texto}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="bp-body text-[11px] font-semibold" style={{ color: C.inkSoft }}>{m.brand} {m.model} · {m.id}</span>
                        <span className="bp-body text-[11px]" style={{ color: C.inkFaint }}>· {a.tiempo}</span>
                      </div>
                    </div>
                    <button onClick={(e) => toggleReviewed(a.id, e)}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: isReviewed ? C.greenSoft : C.surfaceElevated, border: `1px solid ${C.border}` }}>
                      <CheckCircle2 size={13} color={isReviewed ? C.green : C.inkFaint} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <SectionTitle sub="Así podrían verse las futuras notificaciones push">Vista previa de notificaciones</SectionTitle>
      {NOTIFICATION_PREVIEWS.map((n, i) => <NotificationPreviewCard key={i} n={n} />)}
    </div>
  );
}

/* --------------------------------- SHELL --------------------------------- */
const TABS = [
  { key: "inicio", label: "Inicio", icon: Home },
  { key: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { key: "contratos", label: "Contratos", icon: FileText },
  { key: "reportes", label: "Reportes", icon: BarChart3 },
];

export default function BePlanner() {
  const [authed, setAuthed] = useState(false);
  const [authView, setAuthView] = useState("welcome");

  const [tab, setTab] = useState("inicio");
  const [selected, setSelected] = useState(null);
  const [currency, setCurrency] = useState("PEN");
  const [screen, setScreen] = useState(null); // null | 'account' | 'plans'
  const [detailScreen, setDetailScreen] = useState(null); // null | 'reporte'

  const [account, setAccount] = useState({
    nombre: "Usuario BePlanner",
    correo: "usuario@empresa.com",
    empresa: "Mi Empresa de Maquinaria",
    ruc: "",
    plan: "basico",
  });
  const [mantFocus, setMantFocus] = useState(null);
  const [mantFrom, setMantFrom] = useState(null); // { machine, tab } | null — recuerda si se entró desde la ficha de una máquina
  const [addContractTarget, setAddContractTarget] = useState(null);
  const [lastRegistered, setLastRegistered] = useState(null);

  const pendingAlerts = ALERTS.length;
  const alertBadgeColor = ALERTS.some(a => a.level === "rojo") ? C.red : ALERTS.some(a => a.level === "amarillo") ? C.amber : C.green;

  const openMachine = (m) => { setScreen(null); setDetailScreen(null); setSelected(m); };
  const closeMachine = () => { setSelected(null); setDetailScreen(null); };
  const goTab = (t) => { setTab(t); setSelected(null); setScreen(null); setDetailScreen(null); setMantFocus(null); setMantFrom(null); };

  const openMantenimientoFromMachine = () => {
    setMantFrom({ machine: selected, tab });
    setMantFocus(selected);
    setSelected(null);
    setDetailScreen(null);
    setTab("mantenimiento");
  };

  const handleMaintBack = () => {
    if (mantFrom) {
      setSelected(mantFrom.machine);
      setTab(mantFrom.tab);
      setMantFrom(null);
      setMantFocus(null);
    } else {
      setMantFocus(null);
    }
  };

  const openAlert = (alert) => {
    const target = MACHINES.find(x => x.id === alert.machineId);
    if (!target) return;
    setScreen(null);
    setDetailScreen(null);
    setMantFrom(null);
    if (alert.tipo === "mantenimiento") {
      setSelected(null);
      setMantFocus(target);
      setTab("mantenimiento");
    } else {
      setMantFocus(null);
      setSelected(target);
    }
  };

  const openAddContract = (m) => { setAddContractTarget(m); setScreen("addContract"); };

  const handleMachineRegistered = (m) => {
    setLastRegistered(m);
    setScreen("registered");
  };

  const handleSignup = (form) => {
    setAccount(a => ({ ...a, nombre: form.nombre || a.nombre, correo: form.correo || a.correo, empresa: form.empresa || a.empresa, ruc: form.ruc || a.ruc }));
    setAuthed(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6" style={{ background: "#050607" }}>
      <style>{FONTS}</style>
      <div className="w-full max-w-sm rounded-[2.2rem] overflow-hidden flex flex-col bp-body" style={{ background: C.bg, height: 780, boxShadow: "0 25px 60px rgba(0,0,0,0.6)", border: "8px solid #000" }}>

        {!authed ? (
          <div className="flex-1" style={{ background: C.bg }}>
            {authView === "welcome" && <WelcomeScreen go={setAuthView} />}
            {authView === "login" && <LoginScreen go={setAuthView} onLogin={() => setAuthed(true)} />}
            {authView === "signup" && <SignupScreen go={setAuthView} onSignup={handleSignup} />}
            {authView === "forgot" && <ForgotScreen go={setAuthView} />}
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0" style={{ background: C.bgSoft, borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => goTab("inicio")} className="flex items-center gap-2 active:opacity-70 transition-opacity" aria-label="Ir a Inicio">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
                  <Gauge size={16} color={C.bg} />
                </div>
                <span className="bp-display font-semibold text-[15px] tracking-tight" style={{ color: C.ink }}>BePlanner</span>
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelected(null); setScreen("account"); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.surfaceElevated, border: `1px solid ${C.border}` }}>
                  <User size={14} color={C.inkSoft} />
                </button>
                <button onClick={() => goTab("alertas")} className="relative w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.surfaceElevated, border: `1px solid ${C.border}` }}>
                  <Bell size={15} color={C.inkSoft} />
                  {pendingAlerts > 0 && <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-[3px] rounded-full flex items-center justify-center" style={{ background: alertBadgeColor, color: "#fff", fontSize: 8.5, fontWeight: 700, boxShadow: `0 0 5px ${alertBadgeColor}` }}>{pendingAlerts}</span>}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-4" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
              {screen === "account" ? (
                <AccountScreen onBack={() => setScreen(null)} account={account} setAccount={setAccount} goPlans={() => setScreen("plans")} />
              ) : screen === "plans" ? (
                <PlansScreen onBack={() => setScreen("account")} account={account} setAccount={setAccount} />
              ) : screen === "addMachine" ? (
                <AddMachineWizard existingIds={MACHINES.map(x => x.id)} onCancel={() => setScreen(null)} onRegistered={handleMachineRegistered} />
              ) : screen === "addContract" && addContractTarget ? (
                <AddContractScreen m={addContractTarget} onCancel={() => setScreen(null)} onDone={() => setScreen(null)} />
              ) : screen === "registered" && lastRegistered ? (
                <PostRegisterScreen
                  m={lastRegistered}
                  onViewMachine={() => { setScreen(null); setSelected(lastRegistered); }}
                  onConfigureMaint={() => { setScreen(null); setSelected(null); setMantFrom(null); setMantFocus(lastRegistered); setTab("mantenimiento"); }}
                  onLater={() => setScreen(null)}
                />
              ) : selected && detailScreen === "reporte" ? (
                <ReporteDiarioScreen m={selected} onBack={() => setDetailScreen(null)} />
              ) : selected ? (
                <MachineDetail m={selected} onBack={closeMachine} currency={currency} setCurrency={setCurrency} onOpenReporte={() => setDetailScreen("reporte")} onOpenMantenimiento={openMantenimientoFromMachine} onAddContract={() => openAddContract(selected)} />
              ) : (
                <>
                  {tab === "inicio" && <InicioScreen onOpen={openMachine} onAddMachine={() => setScreen("addMachine")} />}
                  {tab === "operacion" && <OperacionScreen onOpen={openMachine} />}
                  {tab === "mantenimiento" && <MantenimientoScreen focusMachine={mantFocus} onSelectMachine={setMantFocus} onBackFromDetail={handleMaintBack} />}
                  {tab === "contratos" && <ContratosScreen onOpen={openMachine} currency={currency} setCurrency={setCurrency} onAddContract={openAddContract} />}
                  {tab === "reportes" && <ReportesScreen />}
                  {tab === "alertas" && <AlertasScreen onNavigate={openAlert} />}
                </>
              )}
            </div>

            {/* Bottom nav */}
            <div className="grid grid-cols-4 shrink-0" style={{ background: C.bgSoft, borderTop: `1px solid ${C.border}`, paddingBottom: "env(safe-area-inset-bottom, 2px)" }}>
              {TABS.map(t => {
                const Icon = t.icon;
                const active = tab === t.key && !screen;
                return (
                  <button key={t.key} onClick={() => goTab(t.key)} className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 active:opacity-70 transition-opacity">
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 28, height: 18, background: active ? C.accentSoft : "transparent" }}>
                      <Icon size={14} color={active ? C.accent : C.inkFaint} strokeWidth={active ? 2.3 : 1.7} />
                    </div>
                    <span className="bp-body" style={{ fontSize: 8.5, lineHeight: "10px", fontWeight: active ? 700 : 500, color: active ? C.accent : C.inkFaint, whiteSpace: "nowrap", letterSpacing: "-0.1px" }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
