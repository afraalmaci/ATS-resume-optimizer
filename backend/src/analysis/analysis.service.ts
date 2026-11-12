import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { extractText, getDocumentProxy } from 'unpdf';
import {
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_BYTES,
} from './analysis.constants';
import { AnalysisResponse } from './dto/analysis-response.dto';
import { calculateATSScore } from './engine/ats-scorer';
import { extractSkills } from './engine/skill-extractor';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  async analyze(
    file: Express.Multer.File | undefined,
    jobDescription: unknown,
  ): Promise<AnalysisResponse> {
    this.validateResume(file);
    const job = this.validateJobDescription(jobDescription);
    const resumeText = await this.readPdfText(file.buffer);

    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(job);
    const { score, missingSkills, matches } = calculateATSScore(
      jobSkills,
      resumeSkills,
    );

    this.logger.debug(
      `Analyzed resume: ${resumeSkills.length} resume skills, ${jobSkills.length} job skills, score ${score}`,
    );

    return { score, resumeSkills, jobSkills, missingSkills, matches };
  }

  private validateResume(
    file: Express.Multer.File | undefined,
  ): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }
    if (file.size > MAX_RESUME_BYTES) {
      throw new PayloadTooLargeException('Resume must be smaller than 5 MB');
    }
    // The content type is set by the client, so also check the file itself
    // starts with the PDF signature.
    const isPdf =
      file.mimetype === 'application/pdf' &&
      file.buffer.subarray(0, 5).toString('latin1') === '%PDF-';
    if (!isPdf) {
      throw new BadRequestException('Resume must be a PDF file');
    }
  }

  private validateJobDescription(value: unknown): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new BadRequestException('Job description is required');
    }
    if (value.length > MAX_JOB_DESCRIPTION_CHARS) {
      throw new BadRequestException(
        `Job description must be at most ${MAX_JOB_DESCRIPTION_CHARS} characters`,
      );
    }
    return value;
  }

  private async readPdfText(buffer: Buffer): Promise<string> {
    let text: string;
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await extractText(pdf, { mergePages: true });
      text = result.text;
    } catch {
      throw new BadRequestException('Could not read the PDF file');
    }

    if (text.trim() === '') {
      throw new UnprocessableEntityException(
        'No readable text found in the PDF. Is it a scanned image?',
      );
    }
    return text;
  }
}
