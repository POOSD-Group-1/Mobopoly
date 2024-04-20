import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./components/Game";
import Landing from "./components/Landing";
import JoinRoom from "./components/JoinRoom";
import CreateRoom from "./components/CreateRoom";
import Lobby from "./components/Lobby";
import ErrorPage from "./components/ErrorPage";
import GameJSON from "./components/GameJSON";
import Rules from "./components/Rules";
import End from "./components/End";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/game",
    element: <GameJSON />,
  },
  {
    path: "/game/:roomCode",
    element: <Game />,
  },
  {
    path: "/end/:roomCode",
    element: <End />
  },
  {
    path: "/join",
    element: <JoinRoom />
  },
  {
    path: "/create",
    element: <CreateRoom />
  },
  {
    path: "/room/:roomCode",
    element: <Lobby />
  },
  {
    path: "/rules",
    element: <Rules/>
  },
  {
    path: "*",
    element: <ErrorPage />,
  }
]);

function App() {
  return <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
}

export default App;
