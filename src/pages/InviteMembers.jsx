import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, invitationAPI } from '../services/api';
import '../styles/InviteMembers.css';

function InviteMembers() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteeEmail, setInviteeEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, membersRes] = await Promise.all([
        projectAPI.getById(projectId),
        invitationAPI.getProjectMembers(projectId)
      ]);

      if (projectRes.success) setProject(projectRes.project);
      if (membersRes.success) setMembers(membersRes.members);
    } catch (err) {
      setError('Failed to fetch project data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await invitationAPI.send({
        projectId,
        inviteeEmail
      });

      if (response.success) {
        setSuccess('Invitation sent successfully!');
        setInviteeEmail('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  return (
    <div className="invite-container">
      <div className="invite-header">
        <button className="btn-back" onClick={() => navigate(`/projects/${projectId}`)}>
          ← Back to Board
        </button>
        <h1>Manage Members - {project.name}</h1>
      </div>

      <div className="invite-content">
        <div className="invite-section">
          <h2>Invite New Member</h2>
          <form onSubmit={handleSendInvitation} className="invite-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={inviteeEmail}
                onChange={(e) => setInviteeEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Send Invitation
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="members-section">
          <h2>Current Members ({members.length})</h2>
          <div className="members-list">
            {members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <h4>{member.username}</h4>
                    <p>{member.email}</p>
                  </div>
                </div>
                {project.owner._id === member._id && (
                  <span className="member-badge">Owner</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteMembers;
