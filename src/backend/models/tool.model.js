// Tool model
module.exports = (sequelize, DataTypes) => {
  const Tool = sequelize.define('Tool', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default'
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return Tool;
};