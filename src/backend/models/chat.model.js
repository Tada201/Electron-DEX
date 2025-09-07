// Chat model
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'New Chat'
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    folderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    shareId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    meta: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return Chat;
};