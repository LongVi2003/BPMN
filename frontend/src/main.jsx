import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormEditorComponent from './components/FormEditorComponent.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/form-editor" element={<FormEditorComponent />} />
    </Routes>
  </BrowserRouter>
);
