import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { query } from 'express';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehiclesService.create(createVehicleDto);
  }

  // @Get()
  // findAll(): Promise<Vehicle[]> {
  //   return this.vehiclesService.findAll();
  // }


  @Get()
  findAll(
    @Query('page') page = 0,
    @Query('limit') limit = 100,
    @Query('search') search?: string,):
    Promise<{data: Vehicle[]; total:number; page: number; limit
    :number}> {
      return this.vehiclesService.findAll(page, limit, search);
    }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Vehicle> {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.vehiclesService.remove(id);
  }

  // @Post('export/age/:minAge')
  // exportByAge(@Param('minAge', ParseIntPipe) minAge: number): Promise<{ jobId: string | number }> {
  //   return this.vehiclesService.exportByAge(minAge);
  // }
}