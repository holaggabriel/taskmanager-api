'use strict';
const { Op } = require('../utils/sequelize');

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
          len: [1, 255]
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
      timestamps: true,
      paranoid: true,
      deletedAt: 'deleted_at'
    }
  );

  // ----------------------------
  // Métodos estáticos para la lógica de negocio
  // ----------------------------

  Task.createWithOwner = async function ({ title, description, status, userId }) {

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

  // Obtener todas las tareas de un usuario específico
  Task.getAllTasksForUser = async function (userId) {
    return this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId }, // solo tareas asociadas a este usuario
          attributes: [] // opcional: no devolver datos del usuario
        }
      ],
      order: [['created_at', 'DESC']],
      paranoid: true
    });
  };

  // Obtener todas las tareas eliminadas de un usuario específico
  Task.getDeletedTasksForUser = async function (userId) {
    return this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          attributes: [] // no devolver datos del usuario
        }
      ],
      where: {
        deleted_at: { [Op.ne]: null } // solo tareas con deleted_at != null
      },
      paranoid: false, // necesario para incluir tareas soft deleted
      order: [['deleted_at', 'DESC']]
    });
  };

  Task.getTaskByIdForUser = async function (taskId, userId) {
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
  Task.updateTaskForUser = async function (taskId, userId, fields) {
    // Buscar la tarea asociada al usuario
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          attributes: [], // no necesitamos datos del usuario
          paranoid: true // excluye tareas soft deleted automáticamente
        }
      ]
    });

    if (!task) return null; // tarea no existe o usuario no asociado

    await task.update(fields);
    return task;
  };

  // Soft delete: solo el owner puede eliminar la tarea
  Task.softDeleteTaskForUser = async function (taskId, userId) {
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } }, // verificar que sea owner
          attributes: []
        }
      ]
    });

    if (!task) return null; // tarea no existe o usuario no es owner

    await task.destroy(); // soft delete
    return task;
  };

  // Soft delete todas las tareas de un usuario
  Task.softDeleteAllTasksForUser = async function (userId) {
    // Buscar todas las tareas donde el usuario es owner
    const tasks = await this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } },
          attributes: []
        }
      ]
    });

    if (!tasks || tasks.length === 0) return 0; // no hay tareas para eliminar

    // Soft delete
    for (const task of tasks) {
      await task.destroy();
    }

    return tasks.length; // devolver cantidad de tareas eliminadas
  };

  // Restore: solo el owner puede restaurar la tarea
  Task.restoreTaskForUser = async function (taskId, userId) {
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } }, // solo owner
          attributes: []
        }
      ],
      paranoid: false // incluir tareas soft deleted
    });

    if (!task || !task.deleted_at) return null; // no existe o no está eliminada

    await task.restore(); // restaurar soft delete
    return task;
  };

  // Restaurar todas las tareas de un usuario
  Task.restoreAllTasksForUser = async function (userId) {
    // Buscar todas las tareas eliminadas del usuario donde es owner
    const tasks = await this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } },
          attributes: []
        }
      ],
      where: { deleted_at: { [Op.ne]: null } }, // solo eliminadas
      paranoid: false
    });

    if (!tasks || tasks.length === 0) return 0; // no hay tareas para restaurar

    // Restaurarlas
    for (const task of tasks) {
      await task.restore();
    }

    return tasks.length; // devolver la cantidad de tareas restauradas
  };

  // Hard delete: solo eliminar permanentemente si ya fue soft deleted
  Task.hardDeleteTaskForUser = async function (taskId, userId) {
    const task = await this.findOne({
      where: { id: taskId },
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } }, // solo owner
          attributes: []
        }
      ],
      paranoid: false // incluir tareas soft deleted
    });

    if (!task) return null; // tarea no existe o usuario no es owner

    if (!task.deleted_at) {
      // la tarea no está soft deleted, no permitir hard delete
      throw new Error("La tarea debe ser eliminada primero (soft delete) antes de poder eliminarla permanentemente.");
    }

    await task.destroy({ force: true }); // eliminar permanentemente
    return task;
  };

  // Hard delete masivo: eliminar permanentemente solo tareas soft deleted
  Task.hardDeleteAllTasksForUser = async function (userId) {
    const tasks = await this.findAll({
      include: [
        {
          model: this.sequelize.models.User,
          as: 'users',
          where: { id: userId },
          through: { where: { role: 'owner' } },
          attributes: []
        }
      ],
      paranoid: false // incluir tareas soft deleted
    });

    // Filtrar solo las que ya están soft deleted
    const tasksToDelete = tasks.filter(task => task.deleted_at);

    if (tasksToDelete.length === 0) return 0; // no hay tareas soft deleted para eliminar

    for (const task of tasksToDelete) {
      await task.destroy({ force: true });
    }

    return tasksToDelete.length; // cantidad de tareas eliminadas permanentemente
  };

  Task.associate = (models) => {
    Task.belongsToMany(models.User, {
      through: models.UserTask,
      foreignKey: 'task_id',
      as: 'users'
    });
  };

  return Task;
};
