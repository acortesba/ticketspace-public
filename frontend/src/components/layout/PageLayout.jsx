import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const PageLayout = () => {
  return (
    <div className="page-container">
      <Navbar />
      <main className="scrollable-content w-full h-full relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default PageLayout;
