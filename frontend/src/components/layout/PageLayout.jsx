import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PageLayout = () => {
  return (
    <div className="page-container">
      <Navbar />
      <main className="scrollable-content pt-20"> {/* pt-20 to account for fixed navbar */}
        <Outlet />
      </main>
    </div>
  );
};

export default PageLayout;
