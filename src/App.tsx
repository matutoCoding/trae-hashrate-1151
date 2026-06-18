import { useState } from 'react';
import Layout from './components/Layout';
import SchedulePage from './pages/SchedulePage';
import RatePage from './pages/RatePage';
import BillingPage from './pages/BillingPage';
import type { PageType } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('schedule');

  const renderPage = () => {
    switch (currentPage) {
      case 'schedule':
        return <SchedulePage />;
      case 'rate':
        return <RatePage />;
      case 'billing':
        return <BillingPage />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
