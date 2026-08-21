import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import ComponentesBotones from './pages/ComponentesBotones';
import ComponentesCards from './pages/ComponentesCards';
import TablesShowcase from './pages/TablesShowcase';
import FormShowcase from './pages/FormShowcase';
import BrandColorSettings from './theme/BrandColorSettings';


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<div>Contenido de Inicio</div>} />
        <Route path="/proyectos" element={<div>Contenido de Proyectos</div>} />
        <Route path="/componentes/botones" element={<ComponentesBotones />} />
        <Route path="/componentes/cards" element={<ComponentesCards />} />
        <Route path="/componentes/tablas" element={<TablesShowcase />} />
        <Route path="/componentes/formularios" element={<FormShowcase />} />
        <Route path="/ajustes" element={<div style={{ padding: 32 }}><BrandColorSettings /></div>} />
      </Route>
    </Routes>
  );
}

export default App;
