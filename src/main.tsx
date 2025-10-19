import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';
import Chat from './pages/Chat';
import Procedures from './pages/Procedures';
import Users from './pages/Users';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout currentPageName="Chat"><Chat /></Layout>} />
          <Route path="/procedures" element={<Layout currentPageName="Procedures"><Procedures /></Layout>} />
          <Route path="/users" element={<Layout currentPageName="Users"><Users /></Layout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
