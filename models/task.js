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

  // Obtener todas las tareas de un usuario específico
  Task.getAllTasksForUser = async function(userId) {
    return this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId }, // solo tareas asociadas a este usuario
          attributes: [] // opcional: no devolver datos del usuario
        }
      ],
      order: [['created_at', 'DESC']]
    });
  };

  // Obtener tarea por ID
  Task.getTaskById = async function(id) {
    return this.findByPk(id);
  };

  Task.getTaskByIdForUser = async function(taskId, userId) {
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId }, // filtra solo si el usuario está asociado
          attributes: [],       // no devolver datos del usuario
        }
      ]
    });

    return task; // null si el usuario no está asociado o la tarea no existe
  };

  // Actualizar tarea
  Task.updateTaskForUser = async function(taskId, userId, fields) {
    // Buscar la tarea asociada al usuario
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          attributes: [], // no necesitamos datos del usuario
        }
      ]
    });

    if (!task) return null; // tarea no existe o usuario no asociado

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

  Task.associate = (models) => {
    Task.belongsToMany(models.User, {
      through: models.UserTask,
      foreignKey: 'task_id',
      as: 'users'
    });
  };

  Task.createWithOwner = async function({ title, description, status, userId }) {

    return this.sequelize.transaction(async (t) => {
      const task = await this.create({ title, description, status }, { transaction: t });
      const user = await this.sequelize.models.User.findByPk(userId, { transaction: t });

      if (!user) {
        throw new Error('User not found');
      }

      await task.addUser(user, { through: { role: 'owner' }, transaction: t });
      return task;
    });
  };

  return Task;
};
