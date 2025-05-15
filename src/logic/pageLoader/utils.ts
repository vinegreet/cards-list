/**
 * Utility functions for event page state calculations.
 * Includes helpers for counting loaded records and extracting visible event IDs.
 */

import { PageState } from './types';

/**
 * Calculates the total number of loaded event records across all pages.
 * @param {Record<number, PageState>} pages - The pages state object.
 * @returns {number} The total number of loaded event records.
 */
export const getTotalLoadedRecords = (pages: Record<number, PageState>) =>
  Object.values(pages).reduce((sum, page) => sum + (page.eventIds?.length || 0), 0);

/**
 * Returns a flat array of all visible event IDs from loaded pages.
 * @param {Record<number, PageState>} pages - The pages state object.
 * @returns {number[]} Array of visible event IDs.
 */
export const getVisibleEventIds = (pages: Record<number, PageState>) => {
  const visibleIds: number[] = [];
  Object.values(pages)
    .filter(page => page.isLoaded && Array.isArray(page.eventIds))
    .forEach(page => {
      visibleIds.push(...page.eventIds);
    });
  return visibleIds;
};
