import {MigrationInterface, QueryRunner} from "typeorm";

export class inital1546397308317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      // TODO: Create Tables
      console.log('yeap, it ran!');
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      // TODO: Destroy Tables
      console.log('yeap, it ran and destroyed everything!');
    }

}
