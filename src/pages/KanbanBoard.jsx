import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectAPI, columnAPI, ticketAPI, invitationAPI } from '../services/api';
import TicketModal from '../components/TicketModal';
import '../styles/KanbanBoard.css';

function KanbanBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectData, columnsData, ticketsData, membersData] = await Promise.all([
        projectAPI.getById(projectId),
        columnAPI.getByProject(projectId),
        ticketAPI.getByProject(projectId),
        invitationAPI.getProjectMembers(projectId)
      ]);

      setProject(projectData.project || null);
      setColumns(columnsData.columns || []);
      setTickets(ticketsData.tickets || []);
      setMembers(membersData.members || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const ticketId = draggableId;
    const newColumnId = destination.droppableId;
    const newIndex = destination.index;

    // Store the current tickets state for potential rollback
    const previousTickets = [...tickets];

    // Optimistic update - update the UI immediately
    const updatedTickets = tickets.map(ticket =>
      ticket._id === ticketId
        ? { ...ticket, column: newColumnId }
        : ticket
    );
    setTickets(updatedTickets);

    try {
      // Send the move request with both columnId and order
      const response = await ticketAPI.move(ticketId, {
        columnId: newColumnId,
        order: newIndex
      });

      if (response.success) {
        // Refresh data to get the latest state from server
        await fetchData();
      }
    } catch (err) {
      console.error('Error moving ticket:', err);
      setError(err.response?.data?.message || 'Failed to move ticket');
      // Revert to previous state on error
      setTickets(previousTickets);
    }
  };

  const handleAddTicket = (columnId) => {
    setSelectedTicket(null);
    setSelectedColumnId(columnId);
    setIsModalOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedColumnId(ticket.column);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setSelectedColumnId(null);
  };

  const handleSaveTicket = () => {
    fetchData();
    handleCloseModal();
  };

  const getTicketsByColumn = (columnId) => {
    return tickets.filter(ticket => ticket.column === columnId);
  };

  const getMemberName = (userId) => {
    const member = members.find(m => m._id === userId);
    return member ? member.username : 'Unassigned';
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      {/* Enhanced Header */}
      <div className="kanban-header">
        <div className="kanban-header-left">
          <div className="kanban-title-wrapper">
            <h1 className="kanban-title">{project?.name}</h1>
            {project?.description && <p className="project-description">{project.description}</p>}
          </div>
        </div>
        <div className="kanban-header-right">
          <button onClick={() => navigate(`/projects/${projectId}/invite`)} className="invite-button" title="Invite members">
            <span className="invite-icon">👥</span>
            <span>Invite</span>
          </button>
          <button onClick={fetchData} className="refresh-button" title="Refresh data">
            <span className="refresh-icon">⟳</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => {
            const columnTickets = getTicketsByColumn(column._id);
            return (
              <div key={column._id} className="kanban-column">
                <div className="column-header">
                  <div className="column-title">
                    <h3>{column.name}</h3>
                  </div>
                  <span className="ticket-count">{columnTickets.length}</span>
                </div>

                <Droppable droppableId={column._id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-content ${
                        snapshot.isDraggingOver ? 'dragging-over' : ''
                      }`}
                    >
                      {columnTickets.length === 0 ? (
                        <div className="column-empty">
                          <div className="empty-icon">📋</div>
                          <p>No tickets yet</p>
                        </div>
                      ) : (
                        columnTickets.map((ticket, index) => (
                          <Draggable
                            key={ticket._id}
                            draggableId={ticket._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`ticket-card ${
                                  snapshot.isDragging ? 'dragging' : ''
                                }`}
                                onClick={() => handleEditTicket(ticket)}
                              >
                                <div className="ticket-header">
                                  <h4 className="ticket-title">{ticket.title}</h4>
                                  <div
                                    className={`priority-badge priority-${ticket.priority || 'low'}`}
                                  >
                                    {ticket.priority || 'low'}
                                  </div>
                                </div>

                                {ticket.description && (
                                  <p className="ticket-description">
                                    {ticket.description}
                                  </p>
                                )}

                                {ticket.tags && ticket.tags.length > 0 && (
                                  <div className="ticket-tags">
                                    {ticket.tags.map((tag, idx) => (
                                      <span key={idx} className="tag">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="ticket-footer">
                                {ticket.assignedTo && (
  <div className="ticket-assignee">
    <div className="assignee-avatar">
      {ticket.assignedTo.username.charAt(0).toUpperCase()}
    </div>
    <span className="assignee-name">
      {ticket.assignedTo.username}
    </span>
  </div>
)}

                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  className="add-ticket-button"
                  onClick={() => handleAddTicket(column._id)}
                >
                  <span className="add-icon">+</span>
                  <span>Add Ticket</span>
                </button>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Ticket Modal */}
      {isModalOpen && (
        <TicketModal
          projectId={projectId}
          columnId={selectedColumnId}
          ticket={selectedTicket}
          members={members}
          onClose={handleCloseModal}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
}

export default KanbanBoard;
