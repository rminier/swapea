export const ListingCondition = {
  NEW: 'NEW',
  LIKE_NEW: 'LIKE_NEW',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR'
} as const;

export type ListingCondition = keyof typeof ListingCondition;

export const OfferStatus = {
  PENDING: 'PENDING',
  COUNTERED: 'COUNTERED',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED'
} as const;

export type OfferStatus = keyof typeof OfferStatus;

export const TradeStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED'
} as const;

export type TradeStatus = keyof typeof TradeStatus;
