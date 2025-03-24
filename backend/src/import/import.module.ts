import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ImportProcessor } from './import.processor';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [
    VehiclesModule,
    // Add the specific queue registration
    BullModule.registerQueue({
      name: 'import-queue',
    }),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
})
export class ImportModule {}