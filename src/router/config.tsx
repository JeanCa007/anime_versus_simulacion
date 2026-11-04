import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import CharactersPage from "../pages/characters/page";
import CharacterDetailPage from "../pages/character/page";
import BattleSetupPage from "../pages/battle/page";
import BattleResultPage from "../pages/battle/result/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/characters",
    element: <CharactersPage />,
  },
  {
    path: "/character/:slug",
    element: <CharacterDetailPage />,
  },
  {
    path: "/battle",
    element: <BattleSetupPage />,
  },
  {
    path: "/battle/:id",
    element: <BattleResultPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;