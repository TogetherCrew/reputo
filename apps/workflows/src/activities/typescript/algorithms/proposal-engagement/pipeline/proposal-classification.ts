import type { ProposalRecord } from '@reputo/deepfunding-portal-api';

import type { ProposalClassification } from '../types.js';

export interface ProposalStatusInfo {
  isAwarded: boolean;
  isCompleted: boolean;
  classification: ProposalClassification;
}

/**
 * Normalize boolean-like values from database (can be boolean or 0/1).
 */
function toBool(value: boolean | number): boolean {
  return value === true || value === 1;
}

/**
 * Classify a proposal based on funding and completion status.
 *
 * Classification rules:
 * - funded_concluded: Awarded AND completed
 * - unfunded: NOT awarded (regardless of completion)
 * - other: Awarded but NOT completed (in progress)
 *
 * @param proposal - The proposal record to classify
 * @returns Status info with classification
 */
export function classifyProposal(proposal: ProposalRecord): ProposalStatusInfo {
  const isAwarded = toBool(proposal.isAwarded);
  const isCompleted = toBool(proposal.isCompleted);

  let classification: ProposalClassification;

  if (isAwarded && isCompleted) {
    classification = 'funded_concluded';
  } else if (!isAwarded) {
    classification = 'unfunded';
  } else {
    classification = 'other';
  }

  return { isAwarded, isCompleted, classification };
}

/**
 * Check if a proposal classification is eligible for scoring.
 * Only 'funded_concluded' and 'unfunded' proposals are scored.
 *
 * @param classification - The proposal classification
 * @returns True if the proposal should be scored
 */
export function isScorableClassification(classification: ProposalClassification): boolean {
  return classification === 'funded_concluded' || classification === 'unfunded';
}
