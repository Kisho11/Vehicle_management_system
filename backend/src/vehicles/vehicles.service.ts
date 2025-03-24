import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Queue } from 'bull';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectQueue('export-queue') private exportQueue: Queue,
    private redisService: RedisService
  ) {}

  calculateVehicleAge(manufacturedDate: Date): number {
    const today = new Date();
    const manufactured = new Date(manufacturedDate);
    let age = today.getFullYear() - manufactured.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (
      today.getMonth() < manufactured.getMonth() ||
      (today.getMonth() === manufactured.getMonth() && today.getDate() < manufactured.getDate())
    ) {
      age--;
    }
    
    return age;
  }

  async invalidateCache() {
    await this.redisService.invalidatePattern('vehicles:page:*');
    await this.redisService.invalidatePattern('vehicle:id:*');
    await this.redisService.invalidatePattern('vehicles:age:*');
  }

  async invalidateVehicleCache(id: number) {
    await this.redisService.del(`vehicle:id:${id}`);
    await this.invalidateCache();
  }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    
    // Calculate age of vehicle
    const manufacturedDate = new Date(createVehicleDto.manufactured_date);
    vehicle.age_of_vehicle = this.calculateVehicleAge(manufacturedDate);
    
    const result = await this.vehiclesRepository.save(vehicle);
    await this.invalidateCache();
    return result;
  }

  async createMany(vehicles: CreateVehicleDto[]): Promise<Vehicle[]> {
    const vehiclesToSave = vehicles.map(vehicleDto => {
      const vehicle = this.vehiclesRepository.create(vehicleDto);
      const manufacturedDate = new Date(vehicleDto.manufactured_date);
      vehicle.age_of_vehicle = this.calculateVehicleAge(manufacturedDate);
      return vehicle;
    });
    
    const result = await this.vehiclesRepository.save(vehiclesToSave);
    await this.invalidateCache();
    return result;
  }

  async findAll(page = 0, limit = 100, search?: string): Promise<{ data: Vehicle[]; total: number; page: number; limit: number }> {
    // Define cache key based on query parameters
    const cacheKey = `vehicles:page:${page}:limit:${limit}:search:${search || 'none'}`;
    
    const cacheResult = await this.redisService.get(cacheKey);
    if (cacheResult) {
      return cacheResult;
    }

    const queryBuilder = this.vehiclesRepository.createQueryBuilder('vehicle');
    
    // Add ordering by manufactured_date in ascending order
    queryBuilder.orderBy('vehicle.manufactured_date', 'ASC');
    
    // Add search condition if provided
    if (search) {
      // Create wildcard search for car_model
      queryBuilder.where('vehicle.car_model LIKE :search', { search: `%${search}%` });
    }
    
    // Add pagination
    queryBuilder.skip(page * limit);
    queryBuilder.take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    
    const result = {
      data,
      total,
      page,
      limit,
    };

    await this.redisService.set(cacheKey, result, 86400); 
    // Store in cache for 24 hours (86400 seconds)
    return result;
  }

  async findOne(id: number): Promise<Vehicle> {
    // Try to get from cache first
    const cacheKey = `vehicle:id:${id}`;
    const cacheResult = await this.redisService.get(cacheKey);
    
    if (cacheResult) {
      return cacheResult;
    }
    
    // If not in cache, get from database
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    
    // Store in cache for 10 minutes
    await this.redisService.set(cacheKey, vehicle, 600);
    
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    
    // Update vehicle fields
    Object.assign(vehicle, updateVehicleDto);
    
    // Recalculate age if manufactured_date is provided
    if (updateVehicleDto.manufactured_date) {
      const manufacturedDate = new Date(updateVehicleDto.manufactured_date);
      vehicle.age_of_vehicle = this.calculateVehicleAge(manufacturedDate);
    }
    
    const result = await this.vehiclesRepository.save(vehicle);
    
    // Invalidate specific vehicle cache and any listings
    await this.invalidateVehicleCache(id);
    
    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.vehiclesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    
    // Invalidate specific vehicle cache and any listings
    await this.invalidateVehicleCache(id);
  }

  // async exportByAge(minAge: number): Promise<{ jobId: string | number }> {
  //   // Add job to Bull queue
  //   const job = await this.exportQueue.add('export-vehicles-by-age', {
  //     minAge,
  //   }, {
  //     attempts: 3, // Retry up to 3 times if there's a failure
  //     removeOnComplete: false, // Keep completed jobs for monitoring
  //     removeOnFail: false, // Keep failed jobs for debugging
  //   });
    
  //   return { jobId: job.id };
  // }

  async findVehiclesByMinAge(minAge: number): Promise<Vehicle[]> {
    // Try to get from cache first
    const cacheKey = `vehicles:age:${minAge}`;
    const cacheResult = await this.redisService.get(cacheKey);
    
    if (cacheResult) {
      return cacheResult;
    }
    
    // If not in cache, get from database
    const vehicles = await this.vehiclesRepository.find({
      where: {
        age_of_vehicle: MoreThanOrEqual(minAge),
      },
      order: {
        manufactured_date: 'ASC',
      },
    });
    
    // Store in cache for 5 minutes
    await this.redisService.set(cacheKey, vehicles, 300);
    
    return vehicles;
  }
}