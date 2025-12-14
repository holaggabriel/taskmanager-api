'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserTask = sequelize.define(
    'UserTask',
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      task_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      role: {
        type: DataTypes.ENUM('owner', 'collaborator'),
        allowNull: false,
        defaultValue: 'owner'
      },
      assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'user_tasks',
      underscored: true,
      timestamps: true
    }
  );

  return UserTask;
};
