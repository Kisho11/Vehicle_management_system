import { Controller, Get, Post, Param, Res, ParseIntPipe } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('age/:minAge')
  exportByAge(@Param('minAge', ParseIntPipe) minAge: number) {
    return this.exportService.exportByAge(minAge);
  }

  @Get('job/:id')
  getJobStatus(@Param('id') id: string) {
    return this.exportService.getJobStatus(id);
  }

  @Get('download/:fileName')
  downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'exports', fileName);
    return res.download(filePath, fileName);
  }

//   @Get('files')
// async listExportFiles() {
//   const exportsDir = path.join(process.cwd(), 'exports');
//   if (!fs.existsSync(exportsDir)) {
//     return { files: [] };
//   }
  
//   const files = await fs.promises.readdir(exportsDir);
//   return { 
//     files: files.map(file => ({
//       fileName: file,
//       createdAt: fs.statSync(path.join(exportsDir, file)).mtime,
//       downloadUrl: `/api/export/download/${file}`
//     }))
//   };
// }
}