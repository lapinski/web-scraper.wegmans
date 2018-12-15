import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Receipt {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: 'datetime'})
  date: Date;

  @Column()
  amount: number;

  @Column()
  url: string;

  @Column()
  store: string;
};
