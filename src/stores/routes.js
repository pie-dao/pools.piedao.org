import { writable } from "svelte/store";

import pools from "../config/pools.json";

import NotFound from "../pages/NotFound.svelte";
import Pool from "../pages/Pool.svelte";

const defaultRouteObj = {
  page: Pool,
  params: {
    address: pools.default,
  },
};

const deriveRoute = () => {
  try {
    const core = window.location.href.split("#")[1];

    if (!core) {
      return [];
    }

    const parts = core.split("/").filter((part) => part && part.length > 0);

    return parts;
  } catch (e) {
    return [];
  }
};

const formatRoute = (route) => {
  switch (route[0] || "root") {
    case "pools":
      const address = (route[1] || "").toLowerCase();
      if (pools.available.includes(address)) {
        return { page: Pool, params: { address } };
      }

      break;
    case "root":
      return defaultRouteObj;
  }

  return { page: NotFound, params: { path: `/${route.join("/")}` } };
};

const route = deriveRoute();

export const currentRoute = writable({ ...formatRoute(route) });

window.addEventListener("hashchange", () => {
  const route = deriveRoute();
  currentRoute.set({ ...formatRoute(route) });
});
