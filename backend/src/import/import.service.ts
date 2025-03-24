import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { VehiclesService } from '../vehicles/vehicles.service';
import { CreateVehicleDto } from '../vehicles/dto/create-vehicle.dto';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class ImportService {
  constructor(
    private readonly vehiclesService: VehiclesService,
    @InjectQueue('import-queue') private importQueue: Queue,
  ) {}


  // {this.setupAutoCleanup()}
  // private setupAutoCleanup() {
  //   // Set up a recurring cleanup job every 10 minutes
  //   // This will clean completed jobs older than 10 minutes
  //   setInterval(() => {
  //     const tenMinutesAgo = 10 * 60 * 1000; // 10 minutes in milliseconds
  //     this.importQueue.clean(tenMinutesAgo, 'completed');
  //     this.importQueue.clean(tenMinutesAgo, 'failed');
  //   }, 10 * 60 * 1000); // Run the cleanup every 10 minutes
  // }

  private async parseExcel(buffer: Buffer): Promise<CreateVehicleDto[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      return this.validateAndTransformData(data);
    } catch (error) {
      throw new BadRequestException(`Invalid Excel file format: ${error.message}`);
    }
  }

  private async parseCsv(buffer: Buffer): Promise<CreateVehicleDto[]> {
    try {
      const results: any[] = [];
      
      // Create a temporary file to handle the CSV parsing
      const tempFile = path.join(os.tmpdir(), `import-${Date.now()}.csv`);
      fs.writeFileSync(tempFile, buffer);
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(tempFile)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            fs.unlinkSync(tempFile); // Clean up temp file
            try {
              const vehicles = await this.validateAndTransformData(results);
              resolve(vehicles);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            fs.unlinkSync(tempFile); // Clean up temp file
            reject(new BadRequestException(`Invalid CSV file format: ${error.message}`));
          });
      });
    } catch (error) {
      throw new BadRequestException(`Failed to parse CSV file: ${error.message}`);
    }
  }

  private validateAndTransformData(data: any[]): CreateVehicleDto[] {
    if (!data || data.length === 0) {
      throw new BadRequestException('No data found in the file');
    }

    return data.map((item, index) => {
      // Check for required fields
      const requiredFields = [
        'first_name',
        'last_name',
        'email',
        'car_make',
        'car_model',
        'vin',
        'manufactured_date',
      ];

      for (const field of requiredFields) {
        if (!item[field]) {
          throw new BadRequestException(`Missing required field: ${field} at row ${index + 1}`);
        }
      }

      // Format date to ISO string if it's not already
      let manufacturedDate: string;
      if (typeof item.manufactured_date === 'string') {
        // Try to convert string to date
        const date = new Date(item.manufactured_date);
        if (isNaN(date.getTime())) {
          throw new BadRequestException(`Invalid date format for: ${item.manufactured_date} at row ${index + 1}`);
        }
        manufacturedDate = date.toISOString().split('T')[0];
      } else if (item.manufactured_date instanceof Date) {
        manufacturedDate = item.manufactured_date.toISOString().split('T')[0];
      } else {
        // Handle Excel date (numeric)
        try {
          const excelDate = XLSX.SSF.parse_date_code(item.manufactured_date);
          if (!excelDate) {
            throw new BadRequestException(`Invalid date format for: ${item.manufactured_date} at row ${index + 1}`);
          }
          const date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
          manufacturedDate = date.toISOString().split('T')[0];
        } catch (error) {
          throw new BadRequestException(`Invalid date value: ${item.manufactured_date} at row ${index + 1}`);
        }
      }

      return {
        first_name: String(item.first_name),
        last_name: String(item.last_name),
        email: String(item.email),
        car_make: String(item.car_make),
        car_model: String(item.car_model),
        vin: String(item.vin),
        manufactured_date: manufacturedDate,
      };
    });
  }

  async importVehicles(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let vehicles: CreateVehicleDto[];

    // Determine file type by extension
    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    
    if (!fileExtension) {
      throw new BadRequestException('Invalid file name. Cannot determine file extension.');
    }
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      vehicles = await this.parseExcel(file.buffer);
    } else if (fileExtension === 'csv') {
      vehicles = await this.parseCsv(file.buffer);
    } else {
      throw new BadRequestException('Unsupported file format. Please upload CSV or Excel files.');
    }

    // Add job to Bull queue
    const job = await this.importQueue.add('import-vehicles', {
      vehicles,
    }, {
      attempts: 3, // Retry up to 3 times if there's a failure
      removeOnComplete: false, // Keep completed jobs for monitoring  for now 
      removeOnFail: false, // Keep failed jobs for debugging
    });
    
    return {
      message: `Started import job for ${vehicles.length} vehicles. Job ID: ${job.id}`,
      count: vehicles.length,
      jobId: job.id,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.importQueue.getJob(jobId);
    
    if (!job) {
      throw new BadRequestException(`Job with ID ${jobId} not found`);
    }
    
    const state = await job.getState();
    const progress = await job.progress() || 0;
    
    return {
      jobId: job.id,
      state,
      progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}