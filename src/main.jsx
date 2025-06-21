import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import SessionPage from './SessionPage.jsx'; // 👈 we’ll create this next
import './index.css';
import DMResponsesPage from './DMResponsesPage.jsx'; // 👈 new page

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
		<Route path="/session/:id/responses" element={<DMResponsesPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
