import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import ComponentesIndex from './pages/ComponentesIndex';
import ComponentesBotones from './pages/ComponentesBotones';
import ComponentesCards from './pages/ComponentesCards';
import TablesShowcase from './pages/TablesShowcase';
import FormShowcase from './pages/FormShowcase';
import ComponentesModales from './pages/ComponentesModales';
import ComponentesNotificaciones from './pages/ComponentesNotificaciones';
import ComponentesNavegacion from './pages/ComponentesNavegacion';
import BrandColorSettings from './theme/BrandColorSettings';
import AjustesIndex from './pages/AjustesIndex';
import Auditoria from './pages/Auditoria';
import ComponentesCalendario from './pages/ComponentesCalendario';
import DemoCalendarioDocente from './pages/DemoCalendarioDocente';


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ComponentesIndex />} />
        <Route path="/componentes" element={<ComponentesIndex />} />
        <Route path="/componentes/botones" element={<ComponentesBotones />} />
        <Route path="/componentes/cards" element={<ComponentesCards />} />
        <Route path="/componentes/tablas" element={<TablesShowcase />} />
        <Route path="/componentes/formularios" element={<FormShowcase />} />
        <Route path="/componentes/modales" element={<ComponentesModales />} />
        <Route path="/componentes/notificaciones" element={<ComponentesNotificaciones />} />
        <Route path="/componentes/navegacion" element={<ComponentesNavegacion />} />
        <Route path="/componentes/calendario" element={<ComponentesCalendario />} />
        <Route path="/calendario" element={<DemoCalendarioDocente />} />
        <Route path="/ajustes" element={<AjustesIndex />} />
        <Route path="/ajustes/colores" element={<div style={{ padding: 32 }}><BrandColorSettings /></div>} />
        <Route path="/auditoria" element={<Auditoria />} />
      </Route>
    </Routes>
  );
}

export default App;
