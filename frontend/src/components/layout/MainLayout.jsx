import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-red-100 selection:text-red-900">
      <Navbar />
      <main className="flex-grow pb-12 pt-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
