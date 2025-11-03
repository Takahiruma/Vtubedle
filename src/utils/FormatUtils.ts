export function normalizePortraitName(str: string): string {
  if (!str) return "";

  const noApostrophes = str.replace(/['’‘´]/g, "");

  const cleaned = noApostrophes.replace(/[^a-zA-Z0-9]+/g, "_");

  return cleaned
    .split("_")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("_");
}


export function formatFollowers(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  return `${year}`;
};