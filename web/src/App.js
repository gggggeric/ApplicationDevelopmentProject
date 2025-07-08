import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLogin from '../src/Auth/AdminLogin';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          {/* Add other routes as needed */}
          {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        </Routes>
      </Router>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{
          width: '100%',
          maxWidth: '500px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </>
  );
}

export default App;