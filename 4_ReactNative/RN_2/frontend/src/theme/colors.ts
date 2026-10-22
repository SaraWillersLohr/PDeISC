// Reúne las paletas para que ambas pantallas mantengan contraste en cada tema.
export const lightColors = {
  background: "#F4F7F6",
  paper: "#FFFFFF",
  hero: "#E7F3EE",
  ink: "#172923",
  muted: "#61736B",
  accent: "#147A57",
  line: "#DCE8E2",
  success: "#16734F",
  warning: "#A45B12",
  warningBackground: "#FFF3E6",
  danger: "#B33737",
  camera: "#10231E",
};

export const darkColors = {
  background: "#101814",
  paper: "#19231D",
  hero: "#22332A",
  ink: "#EDF5EF",
  muted: "#B2C1B7",
  accent: "#72D5A2",
  line: "#35483C",
  success: "#78D9A5",
  warning: "#FFD08A",
  warningBackground: "#3D3020",
  danger: "#FF9999",
  camera: "#080E0A",
};

export type AppColors = { [ColorName in keyof typeof lightColors]: string };
