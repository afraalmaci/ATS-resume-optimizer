import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

export interface Analysis {
  id: string;
  cvText: string;
  jobDescription: string;
  mockAIResponse: string;
}

@Injectable()
export class AnalysisService {
  private analyses: Analysis[] = [];
  create(dto: CreateAnalysisDto): Analysis {
  const result: Analysis = {
        id: (this.analyses.length + 1).toString(),
        cvText: dto.cvText,
        jobDescription: dto.jobDescription,
        mockAIResponse: `Mock analysis for CV: "${dto.cvText}" and Job: "${dto.jobDescription}"`,
   };
   this.analyses.push(result);
   return result;
  }

  findOne(id: string) {
    return this.analyses.find(a => a.id === id);
  }
}