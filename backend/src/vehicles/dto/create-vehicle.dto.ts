import { IsEmail, IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  car_make: string;

  @IsNotEmpty()
  @IsString()
  car_model: string;

  @IsNotEmpty()
  @IsString()
  vin: string;

  @IsNotEmpty()
  @IsDateString()
  manufactured_date: string;

  @IsOptional()
  @IsNumber()
  age_of_vehicle?: number;
}