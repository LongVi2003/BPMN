import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import BpmnViewer from 'bpmn-js/lib/Viewer'; // Import BpmnViewer
import './ProcessDetail.css';
import BpmnModeler from 'bpmn-js/lib/Modeler';


const ProcessDetail = () => {
  const { id } = useParams(); // Extract ID from the URL
  const [processDetail, setProcessDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const bpmnContainerRef = useRef(null); // Container for the BPMN diagram
  const viewerRef = useRef(null); // Ref for BpmnViewer instance

  // Fetch process details
  const fetchProcessDetail = async () => {
    try {
      const response = await fetch(`http://localhost:3000/process-definitions/${id}`, {
        headers: {
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Process Detail:', data); // Debug log
        setProcessDetail(data);

        if (data.deploymentId) {
          await fetchAndRenderDiagram(data.deploymentId);
        } else {
          setError('No deployment ID found for this process.');
        }
      } else {
        const errorText = await response.text();
        setError(`Error fetching process detail: ${errorText}`);
      }
    } catch (err) {
      setError(`Error fetching process detail: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch and render BPMN diagram from deploymentId
  const fetchAndRenderDiagram = async (deploymentId) => {
    try {
      setLoading(true); // Show loading indicator during fetch
      setError(null); // Reset errors before fetching
  
      const response = await fetch(`http://localhost:3000/deployment/${deploymentId}/diagram`, {
        headers: {
          Authorization: 'Basic ' + btoa('demo:demo'),
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        setError(`Error fetching diagram: ${errorText}`);
        return;
      }
  
      const xml = await response.text();
      if (!xml || xml.trim() === '') {
        setError('No diagram data received.');
        return;
      }
  
      renderDiagram(xml); // Render the BPMN diagram
    } catch (err) {
      setError(`Error fetching diagram: ${err.message}`);
    } finally {
      setLoading(false); // Hide loading indicator after fetch
    }
  };
  

  // Render the diagram
  const renderDiagram = (xml) => {
    if (!xml || xml.trim() === '') {
      setError('No valid XML to render.');
      return;
    }

    if (!viewerRef.current) {
      // Initialize viewer instance only once
      viewerRef.current = new BpmnViewer({
        container: bpmnContainerRef.current,
      });
    }

    viewerRef.current.importXML(xml, (err) => {
      if (err) {
        console.error('Error importing BPMN diagram:', err);
        setError('Error rendering diagram');
      } else {
        console.log('Diagram rendered successfully');
        // Adjust view to fit the diagram
        const canvas = viewerRef.current.get('canvas');
        canvas.zoom('fit-viewport');
      }
    });
  };

  useEffect(() => {
    fetchProcessDetail();

    // Cleanup viewer instance on component unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!processDetail) return <div>No process detail available</div>;

  return (
    <div className="process-detail">
      <Navbar />
      <div className="process-sidebar">
        <h4>Definition Version:</h4>
        <p>{processDetail.version || 'N/A'}</p>
        <h4>Version Tag:</h4>
        <p>{processDetail.versionTag || 'N/A'}</p>
        <h4>Definition ID:</h4>
        <p>{processDetail.id}</p>
        <h4>Definition Key:</h4>
        <p>{processDetail.key}</p>
        <h4>Definition Name:</h4>
        <p>{processDetail.name || 'N/A'}</p>
        <h4>History Time To Live:</h4>
        <p>{processDetail.historyTimeToLive || 'N/A'}</p>
        <h4>Tenant ID:</h4>
        <p>{processDetail.tenantId || 'N/A'}</p>
        <h4>Deployment ID:</h4>
        <p>{processDetail.deploymentId || 'N/A'}</p>
        <h4>Instances Running:</h4>
        <p>{processDetail.runningInstances || 0}</p>
        <p>All Versions: {processDetail.totalInstances || 0}</p>
      </div>
      <div className="process-diagram">
        <h4>BPMN Diagram:</h4>
        <div ref={bpmnContainerRef} className="bpmn-container"></div>
        <div className="diagram-controls">
          <button onClick={() => viewerRef.current.get('canvas').zoom('in')}>➕</button>
          <button onClick={() => viewerRef.current.get('canvas').zoom('out')}>➖</button>
        </div>
        <div className="process-tabs">
          <div className="tab-header">
            <button className="active-tab">Process Instances</button>
            <button>Incidents</button>
            <button>Called Process Definitions</button>
            <button>Job Definitions</button>
          </div>
          <div className="tab-content">
            <p>No process instances matched by current filter.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetail;
