import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  async create(@Body() createAnalysisDto: CreateAnalysisDto) {
    try {
      const { resume, jobDescription } = createAnalysisDto;
      const result = await this.analysisService.analyzeResume(resume, jobDescription);
      return { result };
    } catch (error) {
      throw new HttpException('Analysis failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async analyze(@Body() body: { resume: string; jobDescription: string }) {
    return await this.analysisService.analyzeResume(body.resume, body.jobDescription);
  }
}