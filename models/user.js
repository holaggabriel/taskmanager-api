const { Op } = require('../utils/sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true
    }
  );

  // ----------------------------
  // Búsqueda por email o username
  // ----------------------------
  User.findByEmail = async function(email) {
    return this.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), email.toLowerCase())
    });
  };

  User.findByUsername = async function(username) {
    return this.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), username.toLowerCase())
    });
  };

  // ----------------------------
  // Crear usuario con hash de contraseña
  // ----------------------------
  User.createUser = async function({ username, name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.create({ username, name, email, password: passwordHash });
  };

  // ----------------------------
  // Verificar contraseña
  // ----------------------------
  User.prototype.checkPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    User.belongsToMany(models.Task, {
      through: models.UserTask,
      foreignKey: 'user_id',
      as: 'tasks'
    });
  };

  return User;
};
