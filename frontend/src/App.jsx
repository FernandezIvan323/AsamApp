import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewEvent from './pages/NewEvent';
import History from './pages/History';
import EventDetail from './pages/EventDetail';
import EditEvent from './pages/EditEvent';
import ShoppingList from './pages/ShoppingList';
import Inventory from './pages/Inventory';
import Finance from './pages/Finance';
import WeeklyExpenses from './pages/WeeklyExpenses';
import NewMarketPurchase from './pages/NewMarketPurchase';
import Operations from './pages/Operations';
import Recipes from './pages/Recipes';
import Providers from './pages/Providers';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import Templates from './pages/Templates';
import ExportData from './pages/ExportData';

import QuickQuote from './pages/QuickQuote';
import FixedCosts from './pages/FixedCosts';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="new-event" element={<NewEvent />} />
        <Route path="history" element={<History />} />
        <Route path="history/:id" element={<EventDetail />} />
        <Route path="history/:id/edit" element={<EditEvent />} />
        <Route path="shopping-list" element={<ShoppingList />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="providers" element={<Providers />} />
        <Route path="weekly-expenses" element={<WeeklyExpenses />} />
        <Route path="weekly-expenses/new" element={<NewMarketPurchase />} />
        <Route path="operations" element={<Operations />} />
        <Route path="finance" element={<Finance />} />
        <Route path="notes" element={<Notes />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="templates" element={<Templates />} />
        <Route path="quick-quote" element={<QuickQuote />} />
        <Route path="fixed-costs" element={<FixedCosts />} />
        <Route path="export" element={<ExportData />} />
      </Route>
    </Routes>
  );
}

export default App;
