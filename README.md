# BePlanner

Aplicación móvil (prototipo web) para gestión centralizada de maquinaria pesada alquilada a operaciones mineras: fichas de equipo, mantenimiento con IA simulada, contratos, reportes, control de horas y alertas.

Proyecto **React + Vite + Tailwind CSS**. Todo el código de la aplicación (tal como estaba en Claude, sin cambios funcionales ni visuales) vive en `src/App.jsx`.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Compilar para producción

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos estáticos listos para desplegar. Se verificó que este comando compila sin errores antes de entregar el proyecto.

## Vista previa del build de producción (opcional, local)

```bash
npm run preview
```

## Estructura del proyecto

```
BePlanner/
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .gitignore
├── src/
│   ├── main.jsx        # punto de entrada de React
│   ├── App.jsx         # aplicación completa de BePlanner (todo el código original)
│   └── index.css       # directivas de Tailwind
└── public/
```

> **Nota sobre la estructura interna:** BePlanner es actualmente un único componente React (todas las pantallas, datos de ejemplo y lógica están dentro de `src/App.jsx`, tal como funcionaba en Claude). No se dividió en `components/` ni `pages/` porque el pedido explícito fue no modificar ni reorganizar la lógica existente — dividirlo habría implicado tocar código funcional sin necesidad real para el despliegue. La app funciona igual; si más adelante quieren modularizarla en archivos separados, es un cambio de organización de código, no de funcionalidad, y se puede hacer después sin apuros.

## Despliegue en GitHub

```bash
git init
git add .
git commit -m "BePlanner: proyecto Vite listo para producción"
git branch -M main
git remote add origin <URL_DE_TU_REPOSITORIO>
git push -u origin main
```

## Despliegue en Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New... → Project**.
2. Importa el repositorio de GitHub que acabas de subir.
3. Framework Preset: Vercel debería detectar **Vite** automáticamente. Si no:
   - **Root Directory:** `.` (la raíz del repositorio — no hay subcarpetas)
   - **Build Command:** `vite build` (o `npm run build`)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Deploy.

El archivo `vercel.json` incluido ya deja preparada la redirección de rutas hacia `index.html` (necesaria si en el futuro se agrega React Router); con la navegación actual, basada en estado interno y no en URLs, no es indispensable, pero no genera ningún efecto negativo dejarla puesta.

## Notas de seguridad

Este proyecto es un prototipo de frontend sin backend: no hay autenticación real, ni base de datos, ni llamadas a servicios externos (salvo la carga de una tipografía de Google Fonts). Los datos de ejemplo (máquinas, contratos, mantenimientos) viven en memoria y se reinician al recargar la página. Antes de usar en producción con datos reales, se necesita conectar un backend real con autenticación y almacenamiento persistente.
