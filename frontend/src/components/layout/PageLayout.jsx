import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PageLayout = () => {
  return (
    <div className="page-container">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default PageLayout;
