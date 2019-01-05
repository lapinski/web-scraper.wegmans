import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Receipt } from './receipt';

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
  productCode: string;

  @Column()
  productUrl: string;

  @ManyToOne(type => Receipt, receipt => receipt.transactions)
  receipt: Receipt;
}
