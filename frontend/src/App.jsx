import React, { useEffect, useRef, useState, Component} from 'react';
import './App.css';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import addBtn from './assets/add-button.png';
import download from './assets/download.png';
import playbtn from './assets/play-button-arrowhead.png';
import rocket from './assets/rocket.png';

import camundaModdlePackage from 'camunda-bpmn-moddle/resources/camunda';
import { CreateAppendAnythingModule } from 'bpmn-js-create-append-anything';
import UserAssignment from './UserAssignment/UserAssignment.jsx';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import NavBar from './NavBar/NavBar.jsx';


import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule,
} from 'bpmn-js-properties-panel';

function App() {
  const bpmnContainer = useRef(null);
  const modelerRef = useRef(null);
  const propertiesPanelContainer = useRef(null);
  const hasChanges = useRef(false);
  const [showUserAssignment, setShowUserAssignment] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);



  const saveToLocalStorage = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      localStorage.setItem('bpmnDiagram', xml);
      console.log('BPMN diagram saved to localStorage');
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  };
  const loadFromLocalStorage = async () => {
    const xml = localStorage.getItem('bpmnDiagram');
    if(xml){
      try{
        await modelerRef.current.importXML(xml);
        console.log('BPMN diagram load từ local storage thành công');
      }catch(e){
        console.log("",e);        
      }
    }else{
      loadDiagram();
    }
  }

  const loadDiagram = async (file) => {
    try {
      let xml;
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          xml = e.target.result;
          await modelerRef.current.importXML(xml);
          console.log('BPMN diagram tải file không thành công ');
        };
        reader.readAsText(file);
      } else {
        const response = await fetch('/diagram.bpmn');
        xml = await response.text();
        await modelerRef.current.importXML(xml);
        console.log('BPMN diagram tải file URL');
      }
    } catch (err) {
      console.error('Error rendering BPMN diagram:', err);
    }
  };

  const saveDiagram = async () => {
    try {
      const fileName = prompt('Enter a file name:', 'diagram');
      const finalFileName = fileName ? `${fileName}.bpmn` : 'diagram.bpmn';

      const { xml } = await modelerRef.current.saveXML({ format: true });
      const element = document.createElement('a');
      const file = new Blob([xml], { type: 'text/xml' });
      element.href = URL.createObjectURL(file);
      element.download = finalFileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      console.log(`Diagram saved successfully as ${finalFileName}`);
      hasChanges.current = false;
    } catch (err) {
      console.error('Error saving diagram:', err);
    }
  };

  const deployDiagram = async () => {
    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      const formData = new FormData();
      const file = new Blob([xml], { type: 'text/xml' });
      formData.append('diagram', file, 'diagram.bpmn');
  
      const response = await fetch('http://localhost:3000/deployment', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('BPMN diagram deployed thành công vào Camunda Cockpit!');
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
  

  useEffect(() => {
    modelerRef.current = new BpmnModeler({
      container: bpmnContainer.current,
      propertiesPanel: {
        parent: propertiesPanelContainer.current,
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
        BpmnColorPickerModule,
        CreateAppendAnythingModule,
      ],
      moddleExtensions: {
        camunda: camundaModdlePackage,
      },
    });

    loadFromLocalStorage();

    modelerRef.current.on('commandStack.changed', () => {
      console.log('Diagram changed');
      hasChanges.current = true;
      saveToLocalStorage();
    });

    modelerRef.current.on('selection.changed', (event) => {
      const { newSelection } = event;
      const selected = newSelection[0];
      if (selected && selected.businessObject.$type === 'bpmn:UserTask') {
        setSelectedElement(selected);
        setShowUserAssignment(true);
      } else {
        setSelectedElement(null);
        setShowUserAssignment(false);
      }
    });

    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }
    };
  }, []);

  const createNewDiagram = () => {
    const confirmation = window.confirm('Bạn có muốn tạo diagram mới không? Việc này sẽ không lưu thay đổi nếu bạn chưa lưu về');
    if (confirmation) {
      const newDiagramXML = `
        <?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                          xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                          xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                          xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                          id="Definitions_1"
                          targetNamespace="http://bpmn.io/schema/bpmn">
          <bpmn:process id="Process_1" isExecutable="false">
            <bpmn:startEvent id="StartEvent_1" />
          </bpmn:process>
          <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
              <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
                <dc:Bounds x="173" y="102" width="36" height="36" />
              </bpmndi:BPMNShape>
            </bpmndi:BPMNPlane>
          </bpmndi:BPMNDiagram>
        </bpmn:definitions>
      `;
      modelerRef.current.importXML(newDiagramXML);
    }
  };

  return (
    <div className="App">
      <NavBar/>
      <div className="panel-container">
        {showUserAssignment && (
          <UserAssignment
            selectedElement={selectedElement}
            updateProperty={(key, value) => {
              modelerRef.current.get('modeling').updateProperties(selectedElement, { [key]: value });
            }}
          />
        )}
        <div ref={bpmnContainer} className="container"></div>
        <div ref={propertiesPanelContainer} className="properties-panel"></div>
      </div>
      <div className="btn">
        <div onClick={deployDiagram} className="btn-left"><img src={playbtn} alt="" /></div>
        <div onClick={saveDiagram} className="btn-left"><img src={download} alt="" /></div>
        <div onClick={createNewDiagram} className="btn-mid"><img src={addBtn} alt="" /></div>
        <div className="btn-right">
          <input type="file" accept=".bpmn" onChange={(e) => loadDiagram(e.target.files[0])} />
        </div>
      </div>
    </div>
  );
}

export default App;
