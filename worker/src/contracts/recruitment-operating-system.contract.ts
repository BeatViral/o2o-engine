export interface BlindSpotDiagnosisContract {
  stated_need: string;
  likely_real_need: string;
  false_assumptions: string[];
  hidden_failure_modes: string[];
  wrong_candidate_risks: string[];
  missing_success_definition: string[];
  compensation_or_level_mismatch: string[];
  passive_candidate_reality: string;
  corrected_search_thesis: string;
}

export interface RecruitmentOperatingSystemContract {
  blind_spot_diagnosis: BlindSpotDiagnosisContract;
}
