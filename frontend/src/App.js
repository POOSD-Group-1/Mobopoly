import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './components/Home';
import Game from "./components/Game";
import Landing from "./components/Landing";
import JoinRoom from "./components/JoinRoom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/game",
    element: <Game />,
  },
  {
    path: "/join",
    element: <JoinRoom />
  }
]);

function App() {
  return <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
}

export default App;
