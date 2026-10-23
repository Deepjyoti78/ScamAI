import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import InvestigatePage from './pages/InvestigatePage';
import InvestigationResultPage from './pages/InvestigationResultPage';
import InvestigationsListPage from './pages/InvestigationsListPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-page-enter min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/investigate" element={<InvestigatePage />} />
        <Route path="/investigations" element={<InvestigationsListPage />} />
        <Route path="/investigations/:id" element={<InvestigationResultPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
