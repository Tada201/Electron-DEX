// User Preference model
module.exports = (sequelize, DataTypes) => {
  const Preference = sequelize.define('Preference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'general'
    }
  }, {
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'key']
      }
    ]
  });

  return Preference;
};