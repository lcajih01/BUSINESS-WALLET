import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Logbook from './pages/Logbook';
import AddEntry from './pages/AddEntry';
import Bills from './pages/Bills';
import Transfers from './pages/Transfers';
import DailySummary from './pages/DailySummary';
import Calendar from './pages/Calendar';
import DecisionCenter from './pages/DecisionCenter';
import More from './pages/More';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/logbook" element={<Logbook />} />
        <Route path="/add" element={<AddEntry />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/daily" element={<DailySummary />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/decision" element={<DecisionCenter />} />
        <Route path="/more" element={<More />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  );
}
