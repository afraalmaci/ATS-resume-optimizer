import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsNotEmpty()
  @IsString()
  cvText: string;

  @IsNotEmpty()
  @IsString()
  jobDescription: string;
}