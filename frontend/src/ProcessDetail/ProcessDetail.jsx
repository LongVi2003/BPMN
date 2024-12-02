import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import BpmnJS from 'bpmn-js';
import './ProcessDetail.css';

const ProcessDetail = () => {
  const { id } = useParams();
  const [processDetail, setProcessDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Define loading state
  const bpmnContainerRef = useRef(null); // Ref for BPMN container
  const viewerRef = useRef(null); // Ref for BPMN viewer

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
        setLoading(false); // Stop loading when request is complete
      }
    };

    fetchProcessDetail();
  }, [id]);

  useEffect(() => {
    if (processDetail) {
      const viewer = new BpmnJS({
        container: bpmnContainerRef.current,
      });
      viewerRef.current = viewer; // Save viewer instance in ref

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
            canvas.getDefaultLayer().classList.add('drag-enabled')
          } else {
            const errorText = await response.text();
            console.error('Error fetching diagram:', errorText);
          }
        } catch (err) {
          console.error('Error fetching diagram:', err.message);
        }
      };

      fetchDiagram();

      // Cleanup viewer instance on unmount
      return () => {
        viewer.destroy();
      };
    }
  }, [processDetail, id]);

  if (loading) return <div>Loading...</div>; // Show loading indicator
  if (error) return <div className="error">Error: {error}</div>; // Show error message

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
        <div ref={bpmnContainerRef} className="bpmn-container"></div>
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
          }}> Zoom Out</button>        </div>
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
