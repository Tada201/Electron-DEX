// Profile model for chatbot personalities
module.exports = (sequelize, DataTypes) => {
  const Profile = sequelize.define('Profile', {
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
    personality: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    systemPrompt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.7
    },
    maxTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2048
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default'
    },
    isDefault: {
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

  return Profile;
};