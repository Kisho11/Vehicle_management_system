import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { VehiclesService } from '../vehicles/vehicles.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { Cron } from '@nestjs/schedule';
import { RedisService } from '../redis/redis.service';

@Processor('export-queue')
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  private readonly exportsDir = path.join(process.cwd(), 'exports');

  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly webSocketGateway: WebSocketGateway,
    private readonly redisService: RedisService,
  ) {}

  @Process('export-vehicles-by-age')
  async handleExportVehiclesByAge(job: Job<{ minAge: number }>) {
    this.logger.debug(`Processing export job ${job.id} for vehicles with age >= ${job.data.minAge}`);
    
    try {
      // Update job progress
      await job.progress(10);

      const cacheKey = `export:vehicles:min-age:${job.data.minAge}`;
      let vehicles = await this.redisService.get(cacheKey);

      if (!vehicles) {    
        // Get all vehicles with age >= minAge
        vehicles = await this.vehiclesService.findVehiclesByMinAge(job.data.minAge);
      }

      await this.redisService.set(cacheKey, vehicles, 1800); // Cache for 30 minutes
      
      
      if (vehicles.length === 0) {
        const message = `No vehicles found with age >= ${job.data.minAge}`;
        this.webSocketGateway.sendNotification({
          type: 'warning',
          message,
          jobId: String(job.id), // Convert to string
        });
        return { success: false, message };
      }
      
      await job.progress(30);


      // Ensure exports directory exists
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }
      
      // Create CSV file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `vehicles-age-${job.data.minAge}-${timestamp}.csv`;
      const filePath = path.join(exportsDir, fileName);
      
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'first_name', title: 'First Name' },
          { id: 'last_name', title: 'Last Name' },
          { id: 'email', title: 'Email' },
          { id: 'car_make', title: 'Car Make' },
          { id: 'car_model', title: 'Car Model' },
          { id: 'vin', title: 'VIN' },
          { id: 'manufactured_date', title: 'Manufactured Date' },
          { id: 'age_of_vehicle', title: 'Age of Vehicle' },
        ]
      });
      
      await job.progress(60);
      
      // Write data to CSV
      await csvWriter.writeRecords(vehicles);
      
      await job.progress(90);
      
      const message = `Successfully exported ${vehicles.length} vehicles to ${fileName}`;
      
      // Send notification via WebSocket
      this.webSocketGateway.sendNotification({
        type: 'success',
        message,
        jobId: String(job.id), // Convert to string
        data: {
          fileName,
          count: vehicles.length,
          downloadUrl: `http://localhost:3005/api/export/download/${fileName}`
        }
      });
      
      await job.progress(100);
      
      this.logger.debug(message);
      
      return {
        success: true,
        fileName,
        count: vehicles.length,
        message,
      };
    } catch (error) {
      this.logger.error(`Failed to export vehicles: ${error.message}`, error.stack);
      
      // Send error notification via WebSocket
      this.webSocketGateway.sendNotification({
        type: 'error',
        message: `Export failed: ${error.message}`,
        jobId: String(job.id), // Convert to string
      });
      
      throw error;
    }
  }

    // Automated cleanup job that runs daily at midnight
    @Cron('0 0 * * *')
    async cleanupExportFiles() {
      this.logger.log('Starting automated export directory cleanup');
      
      if (!fs.existsSync(this.exportsDir)) {
        this.logger.log('Exports directory does not exist, skipping cleanup');
        return;
      }
      
      try {
        const files = await fs.promises.readdir(this.exportsDir);
        const now = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        let removedCount = 0;
        
        for (const file of files) {
          const filePath = path.join(this.exportsDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtime.getTime();
          
          // Delete files older than 24 hours
          if (fileAge > oneDayMs) {
            await fs.promises.unlink(filePath);
            removedCount++;
            this.logger.log(`Deleted old export file: ${file}`);
          }
        }
        
        this.logger.log(`Export directory cleanup completed - removed ${removedCount} files`);
      } catch (error) {
        this.logger.error(`Error during export directory cleanup: ${error.message}`, error.stack);
      }
    }
}