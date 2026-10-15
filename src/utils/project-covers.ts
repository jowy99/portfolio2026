import type { ImageMetadata } from "astro";

import emotionsApp from "../assets/projects/emotionsapp.png";
import festivalDeGranada from "../assets/projects/festivaldegranada.png";
import fincasEsMoli from "../assets/projects/fincasesmoli.png";
import memoryGame from "../assets/projects/memorygame.png";
import monopoly from "../assets/projects/monopoly.png";
import pythonDatabase from "../assets/projects/pythondatabase.png";
import weatherApp from "../assets/projects/weatherapp.png";

export type ProjectCover = ImageMetadata | string;

const projectCoverAssets: Record<string, ImageMetadata> = {
  "/images/projects/emotionsapp.png": emotionsApp,
  "/images/projects/festivaldegranada.png": festivalDeGranada,
  "/images/projects/fincasesmoli.png": fincasEsMoli,
  "/images/projects/memorygame.png": memoryGame,
  "/images/projects/monopoly.png": monopoly,
  "/images/projects/pythondatabase.png": pythonDatabase,
  "/images/projects/weatherapp.png": weatherApp,
};

export const resolveProjectCover = (cover: ProjectCover): ProjectCover => {
  if (typeof cover !== "string") {
    return cover;
  }

  return projectCoverAssets[cover] ?? cover;
};

export const getProjectCoverSrc = (cover: ProjectCover): string => {
  const resolvedCover = resolveProjectCover(cover);
  return typeof resolvedCover === "string" ? resolvedCover : resolvedCover.src;
};
