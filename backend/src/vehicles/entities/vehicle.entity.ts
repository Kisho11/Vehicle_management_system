import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({unique: true})
  email: string;

  @Column()
  car_make: string;

  @Column()
  car_model: string;

  @Column({unique: true})
  vin: string;

  @Column({ type: 'date' })
  manufactured_date: Date;

  @Column({ type: 'int', nullable: true })
  age_of_vehicle: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}