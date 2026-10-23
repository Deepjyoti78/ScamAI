import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InvestigatePage from './pages/InvestigatePage';
import InvestigationResultPage from './pages/InvestigationResultPage';
import InvestigationsListPage from './pages/InvestigationsListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/investigate" element={<InvestigatePage />} />
        <Route path="/investigations" element={<InvestigationsListPage />} />
        <Route path="/investigations/:id" element={<InvestigationResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
