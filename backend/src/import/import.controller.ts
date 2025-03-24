import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { Express } from 'express';

@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async importFile(@UploadedFile() file: Express.Multer.File) {
    return this.importService.importVehicles(file);
  }

  @Get('job/:id')
  async getJobStatus(@Param('id') id: string) {
    return this.importService.getJobStatus(id);
  }
}