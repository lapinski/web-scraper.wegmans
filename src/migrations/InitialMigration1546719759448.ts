import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1546719759448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "date" date NOT NULL, "quantity" integer NOT NULL, "amount" numeric NOT NULL, "discountAmount" numeric NOT NULL, "productName" character varying NOT NULL, "productCode" character varying NOT NULL, "productUrl" character varying NOT NULL, "receiptId" integer, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "receipt" ("id" SERIAL NOT NULL, "date" date NOT NULL, "amount" numeric NOT NULL, "url" character varying NOT NULL, "store" character varying NOT NULL, CONSTRAINT "PK_b4b9ec7d164235fbba023da9832" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_36607669bcd9352b3317a315a69" FOREIGN KEY ("receiptId") REFERENCES "receipt"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_36607669bcd9352b3317a315a69"`);
        await queryRunner.query(`DROP TABLE "receipt"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
