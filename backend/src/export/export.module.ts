import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { ExportProcessor } from './export.processor';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { RedisModule } from 'src/redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    VehiclesModule,
    WebSocketModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor],
})
export class ExportModule {}