module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    store: {
        type: DataTypes.STRING,
        allowNull: false,
    }
  }, {});

  Receipt.associate = function(models) {
    // associations can be defined here
  };

  return Receipt;
};