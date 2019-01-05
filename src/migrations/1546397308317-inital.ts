import { MigrationInterface, Table, TableForeignKey, QueryRunner} from "typeorm";

const TransactionTableName = 'transactions';
const ReceiptTableName = 'receipts';
const ReceiptIdColumnName = 'receipt_id';

export class inital1546397308317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await this.createReceiptTable(queryRunner);
      await this.createTransactionTable(queryRunner);

      await queryRunner.createForeignKey(
        TransactionTableName,
        new TableForeignKey({
          columnNames: [ReceiptIdColumnName],
          referencedColumnNames: ['id'],
          referencedTableName: ReceiptTableName,
          onDelete: 'CASCADE',
        })
      );

    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      const transactionTable = await queryRunner.getTable(TransactionTableName);
      const isReceiptIdCol = (fk:TableForeignKey) => fk.columnNames.indexOf(ReceiptIdColumnName) !== -1;
      const foreignKey = transactionTable.foreignKeys.find(isReceiptIdCol);

      await queryRunner.dropForeignKey(TransactionTableName, foreignKey);
      await queryRunner.dropTable(TransactionTableName);
      await queryRunner.dropTable(ReceiptTableName);
    }

    private async createTransactionTable(queryRunner: QueryRunner) {
      return queryRunner.createTable(new Table({
        name: TransactionTableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'amount',
            type: 'decimal',
          },
          {
            name: 'discount_amount',
            type: 'decimal',
          },
          {
            name: 'product_name',
            type: 'varchar',
          },
          {
            name: 'product_code',
            type: 'varchar',
          },
          {
            name: 'product_url',
            type: 'varchar',
          }
        ]

      }), true);
    }

    private async createReceiptTable(queryRunner: QueryRunner) {
      return queryRunner.createTable(new Table({
        name: ReceiptTableName,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'date',
            type: 'datetime',
          },
          {
            name: 'amount',
            type: 'decimal',
          },
          {
            name: 'url',
            type: 'varchar',
          },
          {
            name: 'store',
            type: 'varchar',
          }
        ]
      }), true);
    }
}
