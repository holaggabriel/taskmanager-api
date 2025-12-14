'use strict';

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 255]
        }
      },
      description: {
        type: DataTypes.TEXT
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      tableName: 'tasks',
      underscored: true,
      timestamps: true
    }
  );

  // ----------------------------
  // Métodos estáticos para la lógica de negocio
  // ----------------------------

  // Crear tarea
  Task.createTask = async function({ title, description, status }) {
    return this.create({ title, description, status });
  };

  // Obtener todas las tareas
  Task.getAllTasks = async function() {
    return this.findAll({ order: [['created_at', 'DESC']] });
  };

  // Obtener tarea por ID
  Task.getTaskById = async function(id) {
    return this.findByPk(id);
  };

  // Actualizar tarea
  Task.updateTaskById = async function(id, fields) {
    const task = await this.findByPk(id);
    if (!task) return null;
    await task.update(fields);
    return task;
  };

  // Eliminar tarea
  Task.deleteTaskById = async function(id) {
    const task = await this.findByPk(id);
    if (!task) return null;
    await task.destroy();
    return task;
  };

  return Task;
};
