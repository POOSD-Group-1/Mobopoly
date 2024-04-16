import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import ErrorMessage from "./ErrorMessage.js";
import { randomName, validateName, getNameHelperText } from "../data/util.js";
import { errorCodes, makeRoom, joinRoom } from "../data/firebase.js";
import "../styles.css";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(randomName());
    const [errorMessage, setErrorMessage] = useState(null);
    const error = !validateName(name);
    const changeName = (e) => {
        setName(e.target.value);
    }
    const createRoom = async (event) => {
        event.preventDefault();
        if (error) {
            return;
        }
        try {
            let response = await makeRoom();
            if (response === undefined || response.error === undefined) {
                console.error("response to makeRoom undefined");
                return;
            }
            if(response.error != errorCodes.noError) {
                switch(response.error) {
                    case errorCodes.invalidName:
                        setErrorMessage("Invalid name");
                        break;
                    case errorCodes.roomFull:
                        setErrorMessage("Room is full");
                        break;
                    default:
                        setErrorMessage("An unknown error occurred");
                        break;
                }
                return;
            }
            setErrorMessage(null);
            const { roomCode } = response;
            console.log(roomCode);
            response = await joinRoom({ roomCode, name });
            if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error)
                return;
            }
            console.log(response);
            const { userID, roomListener } = response;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            navigate(`/room/${roomCode}`);
        } catch(err) {
            console.error(err);
        }
    };
    return (
        <form className="landing" onSubmit={createRoom}>
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name" required
                value={name}
                onChange={changeName}
                error={error}
                helperText={getNameHelperText(name)} />
            {errorMessage !== null && <ErrorMessage error={errorMessage} />}
            <div className="button-row">
                <Button variant="contained" disabled={error} type="submit"
                    sx={{ marginTop: "1rem" }}>Create Room</Button>
            </div>
        </form>
    );
};

export default CreateRoom;
