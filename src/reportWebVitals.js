import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Aquí puedes enviar las métricas a tu servicio de analytics preferido
  console.log('Web Vitals:', metric);
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics); // Reemplaza a FID en versiones nuevas
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);