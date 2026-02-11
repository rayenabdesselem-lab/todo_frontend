import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Crown, Trash2, UserPlus, Loader, FolderOpen, MoreVertical } from 'lucide-react';
import { projectAPI } from '../services/api';
import '../styles/Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();
      if (response.success) {
        setProjects(response.projects);
      }
    } catch (err) {
      setError('Failed to fetch projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await projectAPI.create(formData);
      if (response.success) {
        setProjects([...projects, response.project]);
        setShowCreateModal(false);
        setFormData({ name: '', description: '', color: '#3b82f6' });
      }
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await projectAPI.delete(projectId);
      if (response.success) {
        setProjects(projects.filter(p => p._id !== projectId));
      }
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="projects-header">
          <div className="projects-header-content">
            <div>
              <h1>My Projects</h1>
              <p className="projects-subtitle">Manage all your projects in one place</p>
            </div>
          </div>
        </div>
        <div className="projects-main">
          <div className="loading-state">
            <Loader className="spinner-icon" />
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="projects-header-content">
          <div>
            <h1>My Projects</h1>
            <p className="projects-subtitle">Manage all your projects in one place</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="projects-main">
        {error && <div className="error-message">{error}</div>}

        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
            >
              <div className="project-card-header">
                <div className="project-icon-wrapper">
                  <div className="project-icon" style={{ background: `${project.color}15`, color: project.color }}>
                    <FolderOpen size={24} />
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{project.name}</h3>
                    {project.description && (
                      <p className="project-description">{project.description}</p>
                    )}
                  </div>
                </div>
                <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-icon"
                    onClick={() => navigate(`/projects/${project._id}/invite`)}
                    title="Invite members"
                  >
                    <UserPlus size={18} />
                  </button>
                  {project.owner._id === JSON.parse(localStorage.getItem('user'))._id && (
                    <button
                      className="btn-icon btn-danger-icon"
                      onClick={() => handleDeleteProject(project._id)}
                      title="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="project-footer">
                <div className="project-meta">
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                  <div className="meta-item">
                    <Crown size={16} />
                    <span>{project.owner.username}</span>
                  </div>
                </div>
                <button
                  className="btn-view-project"
                  onClick={() => navigate(`/projects/${project._id}`)}
                >
                  Open Project
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="empty-state">
              <FolderOpen size={64} className="empty-icon" />
              <h3>No projects yet</h3>
              <p>Create your first project to get started!</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={20} />
                <span>Create Project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
