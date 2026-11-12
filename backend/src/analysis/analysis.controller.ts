import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_RESUME_BYTES } from './analysis.constants';
import { AnalysisService } from './analysis.service';
import { AnalysisResponse } from './dto/analysis-response.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  // The size limit makes multer stop reading an oversized upload early (413).
  @UseInterceptors(
    FileInterceptor('resume', { limits: { fileSize: MAX_RESUME_BYTES } }),
  )
  analyzeResume(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('jobDescription') jobDescription: unknown,
  ): Promise<AnalysisResponse> {
    return this.analysisService.analyze(file, jobDescription);
  }
}
