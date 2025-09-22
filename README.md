# Office Configurator

Aplicación web para configurar oficinas virtuales usando Eagle3D.

## 🚀 Características

- **Home simple** con navegación
- **Configurador 3D** embebido con Eagle3D
- **Web Vitals** integrados para monitoreo de performance
- **React Router** para navegación SPA
- **Deployment optimizado** para Vercel

## 📁 Estructura

```
src/
├── App.jsx           # Página principal
├── OfficePlayer.jsx  # Configurador 3D
├── router.jsx        # Configuración de rutas
├── main.jsx          # Entry point
├── App.css           # Estilos
└── reportWebVitals.js # Monitoreo de performance
```

## 🛠️ Desarrollo

```bash
npm install
npm run dev
```

## 🚢 Deployment en Vercel

1. Conecta tu repositorio a Vercel
2. Los archivos `vercel.json` y `public/_redirects` ya están configurados
3. Vercel detectará automáticamente que es un proyecto Vite

### Configuración incluida:
- `vercel.json` - Reescritura de rutas para SPA
- `public/_redirects` - Backup para redirecciones
- Web Vitals configurados

## 🔧 Scripts

- `npm run dev` - Desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview local del build+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
