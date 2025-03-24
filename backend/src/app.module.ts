import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ImportModule } from './import/import.module';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ExportModule } from './export/export.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './redis/redis.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),//schedule jobs
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_NAME', 'vehicles_db'),
        entities: [Vehicle],
        synchronize: true, //automatically updates database
        charset: 'utf8mb4', //supports all Unicode characters
      }),
      inject: [ConfigService],
    }),
    // Register the BullModule with forRoot before any queue-specific registrations
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    VehiclesModule,
    ImportModule,
    ExportModule,
    WebSocketModule,
    RedisModule,
    RedisModule
  ],
})
export class AppModule {}