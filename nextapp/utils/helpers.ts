export function formatGameTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString([], {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getTeamLogo(teamName: string) {
  const simplifiedName = teamName.split(" ").pop() || teamName;
  return `/assets/${simplifiedName}.png`;
}

export function calculatePotentialPoints(spread: number | undefined): number {
  return 10 + (spread ?? 0);
}
