import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsNotEmpty()
  @IsString()
  resume: string;

  @IsNotEmpty()
  @IsString()
  jobDescription: string;
}