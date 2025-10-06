export function randomColor(seed) {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];
  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
}

export const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length >= 2) {

    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return parts[0][0].toUpperCase();
};

export const detectFileType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "text";
};