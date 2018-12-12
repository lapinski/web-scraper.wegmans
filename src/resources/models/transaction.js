module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      discountAmount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      produtCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      productUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {},
  );

  Transaction.associate = function(models) {
    Transaction.belongsTo(models.Receipt);
  };

  return Transaction;
};
