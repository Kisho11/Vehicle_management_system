import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CreateVehicleDto } from '../vehicles/dto/create-vehicle.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Processor('import-queue')
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Process('import-vehicles')
  async handleImportVehicles(job: Job<{ vehicles: CreateVehicleDto[] }>) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    this.logger.debug(`Importing ${job.data.vehicles.length} vehicles`);
    
    try {
      // Update job progress
      await job.progress(10);
      
      // Process in batches if there are many records to avoid memory issues
      const batchSize = 100;
      const batches: CreateVehicleDto[][] = [];
      const totalVehicles = job.data.vehicles.length;
      
      for (let i = 0; i < totalVehicles; i += batchSize) {
        batches.push(job.data.vehicles.slice(i, i + batchSize));
      }
      
      let processedCount = 0;
      const results: Vehicle[] = [];
      
      for (const batch of batches) {
        const savedVehicles = await this.vehiclesService.createMany(batch);
        results.push(...savedVehicles);
        
        processedCount += batch.length;
        await job.progress(Math.floor((processedCount / totalVehicles) * 100));
      }
      
      this.logger.debug(`Successfully imported ${results.length} vehicles`);
      
      return {
        success: true,
        count: results.length,
        message: `Successfully imported ${results.length} vehicles`,
      };
    } catch (error) {
      this.logger.error(`Failed to import vehicles: ${error.message}`, error.stack);
      throw error;
    }
  }
}