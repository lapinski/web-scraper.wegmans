import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'date'})
  date: Date;

  @Column({type: 'int'})
  quantity: number;

  @Column({type: 'decimal'})
  amount: number;

  @Column({type: 'decimal'})
  discountAmount: number;

  @Column()
  productName: string;

  @Column()
  produtCode: string;

  @Column()
  productUrl: string;
};
