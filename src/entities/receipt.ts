import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './transaction';

@Entity()
export class Receipt {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'date'})
  date: Date;

  @Column({type: 'decimal'})
  amount: number;

  @Column()
  url: string;

  @Column()
  store: string;

  @OneToMany(type => Transaction, transaction => transaction.receipt)
  transactions: Array<Transaction>;
}
