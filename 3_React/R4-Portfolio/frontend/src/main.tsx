import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PortfolioPage } from './pages/PortfolioPage';
import { AdminPage } from './pages/AdminPage';
import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Routes><Route path="/" element={<PortfolioPage/>}/><Route path="/admin" element={<AdminPage/>}/></Routes></BrowserRouter></StrictMode>);
