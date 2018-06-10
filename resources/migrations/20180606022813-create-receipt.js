const receiptsTableName = 'Receipts';
const transactionsTableName = 'Transactions';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(receiptsTableName, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            amount: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
            url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            store: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        })
            .then(() => queryInterface.createTable(transactionsTableName, {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                receiptId: {
                  allowNull: false,
                  type: Sequelize.INTEGER,
                    references: {
                      model: receiptsTableName,
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                quantity: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 1,
                },
                amount: {
                    type: Sequelize.DECIMAL,
                    allowNull: false,
                },
                discountAmount: {
                    type: Sequelize.DECIMAL,
                    allowNull: true,
                },
                productName: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                productCode: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                productUrl: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
            });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable(transactionsTableName)
            .then(() => queryInterface.dropTable(receiptsTableName));
    }
};