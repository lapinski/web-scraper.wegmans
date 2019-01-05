import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import Receipt from './receipt';

@Entity()
export default class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'date'})
  date: Date;

  @Column({type: 'int'})
  quantity: number;

  @Column({type: 'decimal'})
  amount: number;

  @Column({type: 'decimal', name: 'discount_amount'})
  discountAmount: number;

  @Column({name: 'product_name'})
  productName: string;

  @Column({name: 'product_code'})
  productCode: string;

  @Column({name: 'product_url'})
  productUrl: string;

  @ManyToOne(type => Receipt, receipt => receipt.transactions)
  receipt: Receipt;
}
