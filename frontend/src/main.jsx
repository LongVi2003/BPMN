import React from 'react'; // Thêm dòng này
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { UserProvider } from './Login/UserContext.jsx';
import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FormEditorComponent from './components/FormEditorComponent.jsx';
import Login from './Login/Login.jsx';
import Process from './Process/Process.jsx';
import ProcessDetail from './ProcessDetail/ProcessDetail.jsx';
import TaskList from './TaskList/TaskList.jsx';

createRoot(document.getElementById('root')).render(
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<App />} />
          <Route path="/form-editor" element={<FormEditorComponent />} />
          <Route path="/process" element={<Process />} />
          <Route path="/task-list" element={<TaskList />} />
          {/* Redirect '/' to '/login' */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/processdetail/:id" element={<ProcessDetail />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
);
