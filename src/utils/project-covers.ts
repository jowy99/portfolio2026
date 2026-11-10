import type { ImageMetadata } from "astro";

import defiance from "../assets/projects/defiance.png";
import directe from "../assets/projects/directe.png";
import diet from "../assets/projects/diet.png";
import discordBots from "../assets/projects/discord-bots.png";
import emotionsApp from "../assets/projects/emotionsapp.png";
import festivalDeGranada from "../assets/projects/festivaldegranada.png";
import fincasEsMoli from "../assets/projects/fincasesmoli.png";
import meetsync from "../assets/projects/meetsync.png";
import memoryGame from "../assets/projects/memorygame.png";
import monopoly from "../assets/projects/monopoly.png";
import plannr from "../assets/projects/plannr.png";
import pythonDatabase from "../assets/projects/pythondatabase.png";
import recipies from "../assets/projects/recipies.png";
import matiz from "../assets/projects/matiz.png";

export type ProjectCover = ImageMetadata | string;

const projectCoverAssets: Record<string, ImageMetadata> = {
  "/images/projects/defiance.png": defiance,
  "/images/projects/directe.png": directe,
  "/images/projects/diet.png": diet,
  "/images/projects/discord-bots.png": discordBots,
  "/images/projects/emotionsapp.png": emotionsApp,
  "/images/projects/meetsync.png": meetsync,
  "/images/projects/plannr.png": plannr,
  "/images/projects/recipies.png": recipies,
  "/images/projects/festivaldegranada.png": festivalDeGranada,
  "/images/projects/fincasesmoli.png": fincasEsMoli,
  "/images/projects/memorygame.png": memoryGame,
  "/images/projects/monopoly.png": monopoly,
  "/images/projects/pythondatabase.png": pythonDatabase,
  "/images/projects/matiz.png": matiz,
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
