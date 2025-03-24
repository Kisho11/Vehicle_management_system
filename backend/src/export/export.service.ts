import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class ExportService {
  constructor(
    private readonly vehiclesService: VehiclesService,
    @InjectQueue('export-queue') private exportQueue: Queue,
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

  async exportByAge(minAge: number): Promise<{ jobId: string | number }> {
    // Add job to Bull queue
    const job = await this.exportQueue.add('export-vehicles-by-age', {
      minAge,
    }, {
      attempts: 3, // Retry up to 3 times if there's a failure
      removeOnComplete: false, // Keep completed jobs for monitoring for now
      removeOnFail: false, // Keep failed jobs for debugging
    });
    
    return { jobId: job.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.exportQueue.getJob(jobId);
    
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
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