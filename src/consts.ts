import type { Site, Links } from "@/types";

export const SITE: Site = {
  TITLE: "Abscissa",
  DESCRIPTION: "Armiel Pillay's personal website",
  AUTHOR: "Armiel Pillay",
  REPO_URL: "https://github.com/Abscissa24/Portfolio",
};

// Shared with BaseHead (which preloads it) so the URL only lives in one
// place instead of having to stay in sync between the two files.
export const AVATAR_URL = "/Portfolio/Assets/Avatar/Profile.webp";

const BASE = import.meta.env.BASE_URL;

export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: BASE,
  },
  {
    TEXT: "About",
    HREF: `${BASE}about`,
  },
  {
    TEXT: "Projects",
    HREF: `${BASE}projects`,
  },
];
