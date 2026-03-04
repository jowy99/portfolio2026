export type ProjectsSort = "relevance" | "recent" | "impact";

export const DEFAULT_PROJECTS_SORT: ProjectsSort = "relevance";

export const normalizeToken = (value: string): string => value.toLowerCase().trim().replace(/\s+/g, " ");

export const readTrimmedParam = (params: URLSearchParams, key: string): string => {
  return (params.get(key) ?? "").trim();
};

export const parseProjectsSort = (value: string | null | undefined): ProjectsSort => {
  return value === "recent" || value === "impact" ? value : DEFAULT_PROJECTS_SORT;
};

export const parsePositivePage = (value: string | null | undefined, fallback = 1): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const parseStackValues = (params: URLSearchParams): string[] => {
  return params
    .getAll("stack")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0 && normalizeToken(value) !== "all");
};

export const parseNormalizedStackValues = (params: URLSearchParams): string[] => {
  return Array.from(new Set(parseStackValues(params).map((value) => normalizeToken(value))));
};

type ProjectsQueryInput = {
  q?: string;
  sort?: ProjectsSort;
  page?: number;
  stacks?: string[];
};

export const buildProjectsParams = ({ q, sort, page, stacks = [] }: ProjectsQueryInput): URLSearchParams => {
  const params = new URLSearchParams();
  if (q && q.trim().length > 0) {
    params.set("q", q.trim());
  }
  if (sort && sort !== DEFAULT_PROJECTS_SORT) {
    params.set("sort", sort);
  }
  if (page && page > 1) {
    params.set("page", String(page));
  }
  for (const stack of stacks) {
    if (!stack || normalizeToken(stack) === "all") continue;
    params.append("stack", stack);
  }
  return params;
};

export const buildHrefWithParams = (
  basePath: string,
  params: URLSearchParams,
  hash?: string,
): string => {
  const query = params.toString();
  const hashValue = hash ? `#${hash.replace(/^#/, "")}` : "";
  return `${basePath}${query ? `?${query}` : ""}${hashValue}`;
};
