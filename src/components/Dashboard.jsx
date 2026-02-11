import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, projectAPI } from '../services/api';
import Invitations from './Invitations';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = authAPI.getCurrentUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      setProjects(response.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user?.username}!</p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/projects')}
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Projects Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">My Projects</h2>
              <span className="section-count">{projects.length}</span>
            </div>
            <button
              className="btn-view-all"
              onClick={() => navigate('/projects')}
            >
              View All →
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/projects')}
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="project-card"
                  onClick={() => handleProjectClick(project._id)}
                  style={{ borderLeftColor: project.color || '#3b82f6' }}
                >
                  <div className="project-header">
                    <h3 className="project-name">{project.name}</h3>
                    <div className="project-color-dot" style={{ backgroundColor: project.color || '#3b82f6' }}></div>
                  </div>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                  <div className="project-footer">
                    <div className="project-meta">
                      <span className="meta-item">
                        <span className="meta-icon">👥</span>
                        {project.members?.length || 0} members
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">👑</span>
                        {project.owner?.username || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invitations Section */}
        <section className="dashboard-section invitations-section">
          <Invitations />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
