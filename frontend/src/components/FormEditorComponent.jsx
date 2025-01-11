import React, { useRef, useEffect } from 'react';
import { FormEditor } from '@bpmn-io/form-js';
import { RangeField } from "../custom/components/range";
import { RangePropertiesProvider } from "../custom/properties/range";
import addBtn from '../assets/add-button.png';
import download from '../assets/download.png';
import playbtn from '../assets/play-button-arrowhead.png';
import './FormEditorComponent.css';
import Navbar from '../Navbar/Navbar';

const FormEditorComponent = () => {
  const formEditorRef = useRef(null);
  const LOCAL_STORAGE_KEY = 'saveFormSchema';

  const downloadForm = async () => {
    try {
      const fileName = prompt('Enter a file name:', 'form');
      const finalFileName = fileName ? `${fileName}.form` : 'form.form';
      const formSchema = formEditorRef.current.getSchema();
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(formSchema, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = finalFileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      console.log(`Form saved successfully as ${finalFileName}`);
    } catch (err) {
      console.error('Error saving form:', err);
    }
  };

  const newSchema = async () => {
    const alert = window.confirm('Bạn có muốn tạo form mới không? Việc này sẽ không lưu thay đổi nếu bạn chưa lưu về');
    if(alert) {
      try{
        const initialSchema = {
          schemaVersion: 4,
          exporter: {
            name: 'form-js',
            version: '0.1.0',
          },
          type: 'default',
          components: [],
        };
        await formEditorRef.current.importSchema(initialSchema);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSchema));
        console.log('New Form Created successfully');
      }catch (err) {
        console.error('Error creating new form:', err);
      }
    }
  }

  const deployForm = async () => {
    try {
      const formSchema = formEditorRef.current.getSchema();
      const formData = new FormData();
      const file = new Blob([JSON.stringify(formSchema, null, 2)], { type: 'application/json' });
      formData.append('form', file, 'form.form');
  
      const response = await fetch('http://localhost:3000/deploymentForm', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('BPMN diagram deployed successfully!');
        console.log('Deployment Response:', data);
      } else {
        const errorText = await response.text();
        console.error('Deployment error:', errorText);
        alert('Gặp lỗi khi Deployed, vui lòng kiểm tra lại server.');
      }
    } catch (err) {
      console.error('Gặp lỗi khi Deployed:', err);
      alert('Gặp lỗi khi Deployed. Vui lòng thử lại.');
    }
  };

  const loadForm = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const schema = JSON.parse(event.target.result);
        await formEditorRef.current.importSchema(schema);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schema));  
        console.log('Form tải lên thành công');
      } catch (err) {
        console.error('Error importing form:', err);
      }
    };
    reader.readAsText(file);
  };

  const onSchemaChanged = () => {
    const formSchema = formEditorRef.current.getSchema();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formSchema));
    console.log('Form schema updated in local storage');
  };

  const schema = {
    schemaVersion: 4,
    exporter: {
      name: 'form-js',
      version: '0.1.0',
    },
    type: 'default',
    components: [],
  };

  useEffect(() => {
    const initializeFormEditor = async () => {
      try {
        const additionalModules = [
          {
            __init__: ['rangeRenderer', 'rangePropertiesProvider'],
            rangeRenderer: ['type', RangeField],
            rangePropertiesProvider: ['type', RangePropertiesProvider]
          }
        ];

        formEditorRef.current = new FormEditor({
          container: document.querySelector('#form-editor'),
          additionalModules,
        });
        const savedSchema = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSchema) {
          await formEditorRef.current.importSchema(JSON.parse(savedSchema));
        } else {
          await formEditorRef.current.importSchema(schema);
        }

        formEditorRef.current.on('changed', onSchemaChanged);
      } catch (error) {
        console.error(error.message, error.stack);
      }
    };

    initializeFormEditor();
    return () => {
      if (formEditorRef.current) {
        formEditorRef.current.off('changed', onSchemaChanged);
      }
    };
  }, []);

  return (
    
    <div>
       <Navbar />
      <div id="form-editor">
      </div>
      <div className="btn1">
        <div onClick={deployForm} className="btn-left"><img src={playbtn} alt="" /></div>
        <div onClick={downloadForm} className="btn-left">
          <img src={download}  />
        </div>
        <div onClick={newSchema} className="btn-mid">
          <img src={addBtn}  />
        </div>
        <div className="btn-right">
          <input type="file" accept=".form" onChange={(e) => loadForm(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
};

export default FormEditorComponent;
