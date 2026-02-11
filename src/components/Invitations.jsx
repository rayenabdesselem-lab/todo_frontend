import React, { useState, useEffect } from 'react';
import { invitationAPI } from '../services/api';
import './Invitations.css';

function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invitationAPI.getMyInvitations();
      setInvitations(response.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err.response?.data?.message || 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId) => {
    setProcessingId(invitationId);
    try {
      await invitationAPI.accept(invitationId);
      // Remove the accepted invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId) => {
    setProcessingId(invitationId);
    try {
      await invitationAPI.reject(invitationId);
      // Remove the rejected invitation from the list
      setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      setError(err.response?.data?.message || 'Failed to reject invitation');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="invitations-loading">
        <div className="spinner"></div>
        <p>Loading invitations...</p>
      </div>
    );
  }

  if (error && invitations.length === 0) {
    return (
      <div className="invitations-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchInvitations} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="invitations-container">
      <div className="invitations-header">
        <div className="header-title-group">
          <h2>Pending Invitations</h2>
          {invitations.length > 0 && (
            <span className="invitations-count">{invitations.length}</span>
          )}
        </div>
        <button onClick={fetchInvitations} className="refresh-button" disabled={loading}>
          <span className="refresh-icon">↻</span>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="no-invitations">
          <div className="empty-icon">📭</div>
          <h3>No Pending Invitations</h3>
          <p>You're all caught up! No project invitations at the moment.</p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map((invitation) => (
            <div key={invitation._id} className="invitation-card">
              <div className="invitation-content">
                <div className="invitation-icon">✉️</div>
                <div className="invitation-details">
                  <h3 className="project-name">
                    {invitation.project?.name || 'Unknown Project'}
                  </h3>
                  <p className="invitation-info">
                    <span className="inviter-label">From:</span>
                    <span className="inviter-name">
                      {invitation.inviter?.username || 'Unknown User'}
                    </span>
                  </p>
                  {invitation.project?.description && (
                    <p className="project-description">
                      {invitation.project.description}
                    </p>
                  )}
                  <p className="invitation-date">
                    {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="invitation-actions">
                <button
                  onClick={() => handleAccept(invitation._id)}
                  className="accept-button"
                  disabled={processingId === invitation._id}
                >
                  {processingId === invitation._id ? '...' : '✓ Accept'}
                </button>
                <button
                  onClick={() => handleReject(invitation._id)}
                  className="reject-button"
                  disabled={processingId === invitation._id}
                >
                  {processingId === invitation._id ? '...' : '✕ Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Invitations;
