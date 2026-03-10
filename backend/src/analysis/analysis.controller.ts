import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  create(@Body() createAnalysisDto: CreateAnalysisDto) {
    // mock AI response
    return this.analysisService.create(createAnalysisDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.analysisService.findOne(id);
  }
}