import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@styles/index.css';
import './i18n.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* 👈 Đây là phần bị thiếu khiến màn hình trắng */}
  </React.StrictMode>
);
