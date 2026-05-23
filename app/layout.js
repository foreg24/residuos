import './globals.css';

export const metadata = {
  title: 'Trankas — Gestión de Residuos Neiva',
  description: 'La plataforma inteligente para gestión de residuos en Neiva, Huila. Horarios de recolección, reportes comunitarios y asistente IA.',
  manifest: '/manifest.json',
  themeColor: '#020904',
  openGraph: {
    title: 'Trankas — Gestión de Residuos Neiva',
    description: 'La app inteligente de residuos para Neiva',
    type: 'website',
    url: 'https://trankas-nva.vercel.app',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020904',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
