import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  analyzeKeywords(resume: string, jobDescription: string) {
    const resumeWords = resume.toLowerCase().split(/\W+/);
    const jobWords = jobDescription.toLowerCase().split(/\W+/);

    const stopWords = [
      'a',
      'the',
      'for',
      'with',
      'and',
      'to',
      'in',
      'of',
      'looking',
      'on',
      'at',
      'is',
      'an',
    ];

    const filteredJobWords = jobWords.filter(
      (word) => !stopWords.includes(word),
    );
    const uniqueJobWords = [...new Set(filteredJobWords)];

    const matches = uniqueJobWords.filter((word) => resumeWords.includes(word));
    const missingKeywords = uniqueJobWords.filter(
      (word) => !resumeWords.includes(word),
    );

    const score = uniqueJobWords.length
      ? Math.round((matches.length / uniqueJobWords.length) * 100)
      : 0;

    const feedback =
      score === 100
        ? 'Excellent! All keywords matched.'
        : score >= 70
          ? 'Good! Most keywords matched.'
          : score >= 40
            ? 'Average. Some keywords are missing.'
            : 'Poor. Many keywords are missing.';

    return {
      score,
      missingKeywords,
      feedback,
    };
  }
}
