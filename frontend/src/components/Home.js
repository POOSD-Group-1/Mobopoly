import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();


  return <>
    <button onClick={() => navigate("/game")}>Join Game</button>
    <button>Create Game</button>
  </>
}

export default Home;
