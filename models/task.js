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
      timestamps: true,
      paranoid: true,
      deletedAt: 'deleted_at'
    }
  );

  // ----------------------------
  // Métodos estáticos para la lógica de negocio
  // ----------------------------

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
      order: [['created_at', 'DESC']],
      paranoid: true
    });
  };

  // Obtener todas las tareas eliminadas de un usuario específico
  Task.getDeletedTasksForUser = async function(userId) {
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
          paranoid: true // excluye tareas soft deleted automáticamente
        }
      ]
    });

    if (!task) return null; // tarea no existe o usuario no asociado

    await task.update(fields);
    return task;
  };

  // Soft delete: solo el owner puede eliminar la tarea
  Task.softDeleteTaskForUser = async function(taskId, userId) {
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

  // Restore: solo el owner puede restaurar la tarea
  Task.restoreTaskForUser = async function(taskId, userId) {
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

  // Hard delete: solo el owner puede eliminar permanentemente
  Task.hardDeleteTaskForUser = async function(taskId, userId) {
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

    await task.destroy({ force: true }); // eliminar permanentemente
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
