import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1 p-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
