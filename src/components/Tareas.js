import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ItemTypes = { TASK: 'task' };
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// SOLO PLANTILLA
const plantillaNota = { type: 'plantilla-nota' };

const TaskItem = ({ task, onClick, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { ...task },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [task]);

  return (
    <div
      ref={drag}
      className="rounded shadow-sm p-2 text-white m-1"
      style={{
        backgroundColor: task.color || '#90caf9',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        minWidth: 120
      }}
    >
      <span onClick={() => onClick && onClick(task)}>{task.title}</span>
      {onDelete && (
        <span
          onClick={() => onDelete(task.id)}
          className="ms-2 text-white fw-bold float-end"
          style={{ cursor: 'pointer' }}
        >
          -
        </span>
      )}
    </div>
  );
};

const DropZone = ({ onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item) => onDrop(item),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }));

  return (
    <div
      ref={drop}
      className="p-3 rounded mt-3"
      style={{
        background: isOver ? '#e0f7fa' : '#f1f1f1',
        minHeight: 200,
        border: '2px dashed #90caf9'
      }}
    >
      {children}
    </div>
  );
};

export const Tareas = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTasks, setActiveTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Cargar tareas guardadas
  useEffect(() => {
    const stored = localStorage.getItem('activeTasks');
    if (stored) setActiveTasks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
  }, [activeTasks]);

  const handleDrop = (item) => {
    // Solo permite clonación desde plantilla
    if (item.type === 'plantilla-nota') {
      const newTask = {
        id: generateUniqueId(),
        title: 'Nueva Nota',
        color: '#90caf9',
        notes: ''
      };
      setActiveTasks((prev) => [...prev, newTask]);
    }
  };

  const openModal = (task) => {
    setSelectedTask({ ...task }); // copia para editar
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setActiveTasks((prev) => prev.filter(t => t.id !== id));
  };

  const handleSaveTask = () => {
    const updated = activeTasks.map((t) =>
      t.id === selectedTask.id ? selectedTask : t
    );
    setActiveTasks(updated);
    setModalOpen(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container py-4">
        <h3 className="mb-3">Panel de Notas</h3>

        {/* SOLO UNA NUBE ARRIBA */}
        <div className="d-flex gap-3 flex-wrap">
          <TaskItem task={{ ...plantillaNota, title: 'Notas', color: '#90caf9' }} />
        </div>

        {/* ZONA DONDE SE COLOCAN LAS NOTAS */}
        <DropZone onDrop={handleDrop}>
          <h5 className="text-muted">Arrastra aquí para crear nuevas notas:</h5>
          <div className="d-flex flex-wrap">
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={openModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DropZone>

        {/* MODAL PARA EDITAR */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Nota</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <label className="form-label">Título</label>
            <input
              type="text"
              className="form-control mb-2"
              value={selectedTask?.title || ''}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, title: e.target.value })
              }
            />

            <label className="form-label">Contenido</label>
            <textarea
              className="form-control mb-2"
              rows={4}
              placeholder="Escribe tus notas..."
              value={selectedTask?.notes || ''}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, notes: e.target.value })
              }
            />

            <label className="form-label">Color</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={selectedTask?.color || '#90caf9'}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, color: e.target.value })
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" onClick={handleSaveTask}>Guardar</button>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cerrar</button>
          </Modal.Footer>
        </Modal>
      </div>
    </DndProvider>
  );
};