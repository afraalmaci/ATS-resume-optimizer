import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { getDocumentProxy, extractText } from 'unpdf';
import { extractSkills } from './engine/skill-extractor';
import { normalizeSkill } from './engine/skill-normalizer';
import { calculateATSScore } from './engine/ats-scorer';
@Controller('analysis')
export class AnalysisController {
  private readonly logger = new Logger(AnalysisController.name);

  @Post()
  @UseInterceptors(FileInterceptor('resume'))
  async analyzeResume(
    @UploadedFile() file: Express.Multer.File,
    @Body('jobDescription') jobDescription: string,
  ) {
    if (!file) throw new Error('No file uploaded');

    // ===== PDF PARSE =====
    const pdfProxy = await getDocumentProxy(new Uint8Array(file.buffer));
    const result = await extractText(pdfProxy, { mergePages: true });

    let resumeText = '';

    if (typeof result.text === 'string') {
      resumeText = result.text;
    } else if (Array.isArray(result.text)) {
      resumeText = (result.text as string[]).join('\n');
    }

    // ===== SKILL EXTRACTION =====
    const resumeSkillsRaw = extractSkills(resumeText);
    const jobSkillsRaw = extractSkills(jobDescription);

    // ===== NORMALIZATION =====
    const resumeSkills = resumeSkillsRaw.map((s) => normalizeSkill(s));
    const jobSkills = jobSkillsRaw.map((s) => normalizeSkill(s));

    // ===== ATS SCORE ENGINE =====
    const atsResult = calculateATSScore(jobSkills, resumeSkills);

    this.logger.debug(
      `Analyzed resume: ${resumeSkills.length} resume skills, ${jobSkills.length} job skills, score ${atsResult.score}`,
    );

    return {
      score: atsResult.score,
      resumeSkills,
      jobSkills,
      missingSkills: atsResult.missingSkills,
      matches: atsResult.matches,
    };
  }
}
