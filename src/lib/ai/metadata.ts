import { IDataQuality, ISectionConfidence, IAiMetadata } from "@/types/report";

export function calculateOverallConfidence(
  dataQuality: IDataQuality,
  sectionConfidence: ISectionConfidence
): number {
  // Base score from AI's section confidence (average)
  const sectionValues = Object.values(sectionConfidence);
  const aiBaseScore = sectionValues.reduce((a, b) => a + b, 0) / sectionValues.length;

  // Weight modifiers based on data quality
  let dataQualityModifier = 0;

  // 1. Completeness bonus/penalty
  if (dataQuality.completeness === "high") dataQualityModifier += 10;
  else if (dataQuality.completeness === "low") dataQualityModifier -= 15;

  // 2. Source availability
  if (dataQuality.websiteAnalyzed) dataQualityModifier += 5;
  if (dataQuality.documentsAnalyzed > 0) dataQualityModifier += 10;

  // 3. Missing info penalty
  const missingCount = dataQuality.missingInfo?.length || 0;
  dataQualityModifier -= missingCount * 3;

  // 4. Estimated reliability provided by AI
  const reliabilityModifier = (dataQuality.estimatedReliability - 50) * 0.2; // small influence

  let finalScore = aiBaseScore + dataQualityModifier + reliabilityModifier;

  // Ensure within 0-100 bounds
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  return finalScore;
}

export function generateAiMetadata(
  startTimeMs: number,
  overallConfidenceScore: number,
  model: string = "llama-3.3-70b-versatile"
): IAiMetadata {
  return {
    modelUsed: model,
    generationTimestamp: new Date(),
    processingDurationMs: Date.now() - startTimeMs,
    promptVersion: "1.2.0-explainable",
    overallConfidenceScore
  };
}
