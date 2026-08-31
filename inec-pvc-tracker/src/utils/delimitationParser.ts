/**
 * Delimitation Code Parser Utility
 * Handles parsing of INEC electoral codes in multiple formats
 */

import type { DelimitationData } from '../types';
import { OGUN_STATE, getLGAByCode, getWardByCode, getPollingUnitByCode } from '../data/electoralData';

/**
 * Parse a delimitation code string into structured data
 * Supports formats: "27-20-15-008", "27/20/15/008", "27 20 15 008"
 */
export const parseDelimitationCode = (code: string): DelimitationData | null => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  // Normalize the code: replace hyphens and spaces with slashes
  const normalizedCode = code.replace(/[-\s]/g, '/');
  
  // Split by slash to get components
  const parts = normalizedCode.split('/').filter(p => p.trim() !== '');
  
  // Validate we have exactly 4 parts
  if (parts.length !== 4) {
    console.warn(`Invalid delimitation code format: ${code}. Expected 4 parts separated by /, -, or space.`);
    return null;
  }

  const [stateCode, lgaCode, wardCode, puCode] = parts.map(p => p.trim());

  // Validate state code (should be 27 for Ogun)
  if (stateCode !== OGUN_STATE.code) {
    console.warn(`Invalid state code: ${stateCode}. Expected ${OGUN_STATE.code} for Ogun State.`);
    return null;
  }

  // Get LGA name from code
  const lga = getLGAByCode(lgaCode);
  if (!lga) {
    console.warn(`Unknown LGA code: ${lgaCode}`);
    return null;
  }

  // Get Ward name from code
  const ward = getWardByCode(lgaCode, wardCode);
  if (!ward) {
    console.warn(`Unknown ward code: ${wardCode} for LGA ${lgaCode}`);
  }

  // Get PU name from code
  const pu = getPollingUnitByCode(stateCode, lgaCode, wardCode, puCode);
  if (!pu) {
    console.warn(`Unknown polling unit code: ${puCode} for ward ${wardCode}`);
  }

  // Build the full standardized code (slash-separated)
  const fullCode = `${stateCode}/${lgaCode}/${wardCode}/${puCode.padStart(3, '0')}`;

  return {
    fullCode,
    stateCode,
    stateName: OGUN_STATE.name,
    lgaCode,
    lgaName: lga?.name || 'Unknown',
    wardCode,
    wardName: ward?.name || 'Unknown',
    puCode: puCode.padStart(3, '0'),
    puName: pu?.name || 'Unknown'
  };
};

/**
 * Format a delimitation code into a specific separator format
 */
export const formatDelimitationCode = (
  stateCode: string,
  lgaCode: string,
  wardCode: string,
  puCode: string,
  separator: '/' | '-' | ' ' = '/'
): string => {
  const paddedPuCode = puCode.padStart(3, '0');
  return `${stateCode}${separator}${lgaCode}${separator}${wardCode}${separator}${paddedPuCode}`;
};

/**
 * Validate if a delimitation code string is valid
 */
export const isValidDelimitationCode = (code: string): boolean => {
  const parsed = parseDelimitationCode(code);
  return parsed !== null && 
         parsed.lgaName !== 'Unknown' && 
         parsed.wardName !== 'Unknown' && 
         parsed.puName !== 'Unknown';
};

/**
 * Generate delimitation code from hierarchical selection
 */
export const generateDelimitationCode = (
  stateCode: string,
  lgaCode: string,
  wardCode: string,
  puCode: string
): string => {
  return formatDelimitationCode(stateCode, lgaCode, wardCode, puCode, '/');
};

/**
 * Extract hierarchy level from delimitation code
 * Returns: 'state', 'lga', 'ward', or 'polling_unit'
 */
export const getHierarchyLevel = (code: string): string | null => {
  const parsed = parseDelimitationCode(code);
  if (!parsed) return null;

  // Check how specific the code is
  if (parsed.puName !== 'Unknown') return 'polling_unit';
  if (parsed.wardName !== 'Unknown') return 'ward';
  if (parsed.lgaName !== 'Unknown') return 'lga';
  return 'state';
};

/**
 * Get parent code at specified level
 */
export const getParentCode = (
  code: string,
  level: 'state' | 'lga' | 'ward'
): string | null => {
  const parsed = parseDelimitationCode(code);
  if (!parsed) return null;

  switch (level) {
    case 'state':
      return parsed.stateCode;
    case 'lga':
      return `${parsed.stateCode}/${parsed.lgaCode}`;
    case 'ward':
      return `${parsed.stateCode}/${parsed.lgaCode}/${parsed.wardCode}`;
    default:
      return null;
  }
};

/**
 * Compare two delimitation codes for equality
 */
export const compareDelimitationCodes = (code1: string, code2: string): boolean => {
  const parsed1 = parseDelimitationCode(code1);
  const parsed2 = parseDelimitationCode(code2);
  
  if (!parsed1 || !parsed2) return false;
  
  return parsed1.fullCode === parsed2.fullCode;
};

/**
 * Check if a code is at or below a certain hierarchy level
 */
export const isCodeAtOrBelowLevel = (
  code: string,
  level: 'state' | 'lga' | 'ward' | 'polling_unit'
): boolean => {
  const parsed = parseDelimitationCode(code);
  if (!parsed) return false;

  const levelOrder = ['state', 'lga', 'ward', 'polling_unit'];
  const codeLevel = getHierarchyLevel(code);
  if (!codeLevel) return false;

  const targetIndex = levelOrder.indexOf(level);
  const codeIndex = levelOrder.indexOf(codeLevel);

  return codeIndex >= targetIndex;
};
