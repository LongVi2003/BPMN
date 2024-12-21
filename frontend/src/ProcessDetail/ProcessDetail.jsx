import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import BpmnJS from 'bpmn-js';
import './ProcessDetail.css';
import deleteIcon from '../assets/delete.png';


const ProcessDetail = () => {
  const { id } = useParams();
  const [processDetail, setProcessDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('instances'); // State for active tab
  const [instances, setInstances] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [calledDefinitions, setCalledDefinitions] = useState([]);
  const [jobDefinitions, setJobDefinitions] = useState([]);
  const [processInstances, setProcessInstances] = useState([]);
  const bpmnContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const [variables, setVariables] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  

  useEffect(() => {
    const fetchProcessDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/process-definitions/${id}`, {
          headers: {
            Authorization: 'Basic ' + btoa('demo:demo'),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProcessDetail(data);
        } else {
          const errorText = await response.text();
          setError(errorText);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessDetail();
  }, [id]);

  useEffect(() => {
    
    if (processDetail) {
      const viewer = new BpmnJS({
        container: bpmnContainerRef.current,
      });
      viewerRef.current = viewer;

      const fetchDiagram = async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/process-definition/${id}/diagram`,
            {
              headers: {
                Authorization: 'Basic ' + btoa('demo:demo'),
              },
            }
          );

          if (response.ok) {
            const diagramXML = await response.text();
            await viewer.importXML(diagramXML);
            const canvas = viewer.get('canvas');
            canvas.zoom('fit-viewport');
            canvas.getDefaultLayer().classList.add('drag-enabled');
          } else {
            const errorText = await response.text();
            console.error('Error fetching diagram:', errorText);
          }
        } catch (err) {
          console.error('Error fetching diagram:', err.message);
        }
      };

      fetchDiagram();
    }
  }, [processDetail, id]);


  

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const response = await fetch(`http://localhost:3000/process-instances/${processDetail?.id}`, {
          headers: {
            Authorization: 'Basic ' + btoa('demo:demo'),
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setInstances(data.data); 
        } else {
          const errorText = await response.text();
          console.error('Error fetching instances:', errorText);
        }
      } catch (err) {
        console.error('Error fetching instances:', err.message);
      }
    };
  
    if (processDetail?.id) fetchInstances(); 
  }, [processDetail?.id]);

  const fetchVariables = async (processInstanceId) => {
    try {
      const response = await fetch(`http://localhost:3000/variable-instance/${processInstanceId}`, {
        headers: {
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setVariables((prevVariables) => ({
          ...prevVariables,
          [processInstanceId]: data.data[processInstanceId] || [], // Lưu biến theo instance ID
        }));
      } else {
        const errorText = await response.text();
        console.error('Error fetching variables:', errorText);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  
  


  const formatDateTime = (dateTimeString)=>{
    if(!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  

  const deleteProcessIntancesById = async (instanceId) => {
    const confirmation = window.confirm(`Are you sure you want to delete this process?`)
    if(confirmation) {
      try {
        const response = await fetch(`http://localhost:3000/process-instances/${instanceId}?cascade=true`, {
          method: 'DELETE',
          headers: {
            Authorization: 'Basic ' + btoa('demo:demo'),
          },
        });
  
        if (response.ok) {
          setProcessInstances((prevInstances) => prevInstances.filter((instance) => instance.id !== instanceId));
          alert('Xóa thành công Process Instance');
        } else {
          const errorText = await response.text();
          console.error('Error deleting process instance:', errorText);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    };
    }




  const editVariable = async (variableName, newType, newValue) => {
    try {
      // Attempt to parse newValue into the appropriate type
      let parsedValue = newValue;
      if (newType === 'Double') {
        parsedValue = parseFloat(newValue);
        if (isNaN(parsedValue)) {
          alert('Invalid value for type Double');
          return;
        }
      } else if (newType === 'Integer') {
        parsedValue = parseInt(newValue, 10);
        if (isNaN(parsedValue)) {
          alert('Invalid value for type Integer');
          return;
        }
      }
  
      const response = await fetch(`http://localhost:3000/variable-instance/${selectedInstance}/${variableName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
        body: JSON.stringify({ type: newType, value: parsedValue }),
      });
  
      if (response.ok) {
        alert('Variable updated successfully');
        fetchVariables(selectedInstance); // Refresh the variables
      } else {
        const errorText = await response.text();
        console.error('Error updating variable:', errorText);
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  };
  
  
  const deleteVariable = async (variableName) => {
    const confirmation =  window.confirm(`Are you sure you want to delete this variable?`)

    if (confirmation){
      try {
        const response = await fetch(`http://localhost:3000/variable-instance/${selectedInstance}/${variableName}`, {
          method: 'DELETE',
          headers: {
            Authorization: 'Basic ' + btoa('demo:demo'),
          },
        });
    
        if (response.ok) {
          alert('Variable deleted successfully');
          fetchVariables(selectedInstance); // Refresh the variables
        } else {
          const errorText = await response.text();
          console.error('Error deleting variable:', errorText);
        }
      } catch (err) {
        console.error('Error:', err.message);
      }
    }
  };
  

  const renderTabContent = () => {
    switch (activeTab) {
      case 'instances':
        return instances.length ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Start Time</th>
                  <th>Business Key</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((instance) => (
                  <tr key={instance.id}>
                    <td
                      onClick={() => {
                        setSelectedInstance(instance.id); // Lưu instance được chọn
                        if (!variables[instance.id]) fetchVariables(instance.id); // Lấy biến nếu chưa có
                      }}
                      style={{ cursor: 'pointer', color: 'blue' }}
                    >
                      {instance.id}
                    </td>
                    <td>{formatDateTime(instance.startTime)}</td>
                    <td>{instance.businessKey || 'N/A'}</td>
                    <td>
                      <img
                        src={deleteIcon}
                        alt="Delete"
                        onClick={() => deleteProcessIntancesById(instance.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
  
            {/* Hiển thị biến của instance được chọn */}
            {selectedInstance && variables[selectedInstance] && (
              <div>
                <h3>Process Instance ID: {selectedInstance}</h3>
                {variables[selectedInstance].length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variables[selectedInstance].map((variable) => (
                        <tr key={variable.id}>
                          <td>{variable.name}</td>
                          <td>
                            <input
                              type="text"
                              defaultValue={variable.type}
                              onBlur={(e) =>
                                editVariable(variable.name, e.target.value, variable.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              defaultValue={JSON.stringify(variable.value)}
                              onBlur={(e) =>
                                editVariable(variable.name, variable.type, e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                editVariable(variable.name, variable.type, variable.value)
                              }
                            >
                              Edit
                            </button>
                            <img
                              src={deleteIcon}
                              alt="Delete"
                              onClick={() => deleteVariable(variable.name)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No variables found for this instance.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <p>No process instances matched by current filter.</p>
        );
      default:
        return null;
    }
  };
  
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  return (
    <div className="process-detail">
      <Navbar />
      <div className="process-sidebar"> 
        <h4>Definition Version:</h4>
        <p>{processDetail?.version || 'N/A'}</p>
        <h4>Version Tag:</h4>
        <p>{processDetail?.versionTag || 'N/A'}</p>
        <h4>Definition ID:</h4>
        <p>{processDetail?.id}</p>
        <h4>Definition Key:</h4>
        <p>{processDetail?.key}</p>
        <h4>Definition Name:</h4>
        <p>{processDetail?.name || 'N/A'}</p>
        <h4>History Time To Live:</h4>
        <p>{processDetail?.historyTimeToLive || 'N/A'}</p>
        <h4>Tenant ID:</h4>
        <p>{processDetail?.tenantId || 'N/A'}</p>
        <h4>Deployment ID:</h4>
        <p>{processDetail?.deploymentId || 'N/A'}</p>
        <h4>Instances Running:</h4>
        <p>{processDetail?.runningInstances || 0}</p>
        <p>All Versions: {processDetail?.totalInstances || 0}</p>
      </div>
      <div className="process-diagram">
        <div ref={bpmnContainerRef} className="bpmn-container">
        </div>
        <div className="diagram-controls">
          <button onClick={() =>{const canvas = viewerRef.current.get('canvas');
            if(canvas){
              const zoomIn = canvas.zoom();
              canvas.zoom(zoomIn + 0.1);
            }
          }}> Zoom In</button>
          <button onClick={() =>{const canvas = viewerRef.current.get('canvas');
            if(canvas){
              const zoomOut = canvas.zoom();
              canvas.zoom(zoomOut - 0.1);
            }
          }}> Zoom Out</button>        
          </div>
        <div className="process-tabs">
          <div className="tab-header">
            <button className={activeTab === 'instances' ? 'active-tab' : ''} onClick={() => setActiveTab('instances')}>
              Process Instances
            </button>
            <button className={activeTab === 'incidents' ? 'active-tab' : ''} onClick={() => setActiveTab('incidents')}>
              Incidents
            </button>
            <button
              className={activeTab === 'calledDefinitions' ? 'active-tab' : ''}
              onClick={() => setActiveTab('calledDefinitions')}
            >
              Called Process Definitions
            </button>
            <button className={activeTab === 'jobDefinitions' ? 'active-tab' : ''} onClick={() => setActiveTab('jobDefinitions')}>
              Job Definitions
            </button>
          </div>
          <div className="tab-content">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetail;
