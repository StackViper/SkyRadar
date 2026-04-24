export const msToKmh = (ms: number) => Math.round(ms * 3.6);

export const getFlightStatus = (verticalRate: number) => {
  if (verticalRate > 0.5) return 'Climbing';
  if (verticalRate < -0.5) return 'Descending';
  return 'Level Flight';
};

export const formatTimeAgo = (timestamp: number | null) => {
  if (!timestamp) return 'Never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  return `${seconds} sec ago`;
};
