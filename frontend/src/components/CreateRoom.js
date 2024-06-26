import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, CircularProgress, TextField } from '@mui/material';
import ErrorMessage from "./ErrorMessage.js";
import { randomName, validateName, getNameHelperText } from "../data/util.js";
import { errorCodes, makeRoom, joinRoom } from "../data/firebase.js";
import "../styles.css";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(randomName());
    const [errorMessage, setErrorMessage] = useState(null);
    const [creating, setCreating] = useState(false);
    const error = !validateName(name);
    const changeName = (e) => {
        setName(e.target.value);
    }
    const createRoom = async (event) => {
        if (creating) return;
        event.preventDefault();
        if (error) {
            return;
        }
        try {
            setCreating(true);
            let response = await makeRoom();
            setCreating(false);
            if (response === undefined || response.error === undefined) {
                console.error("response to makeRoom undefined");
                return;
            }
            if (response.error != errorCodes.noError) {
                switch (response.error) {
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
            setCreating(true);
            response = await joinRoom({ roomCode, name });
            setCreating(false);
            if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error)
                return;
            }
            console.log(response);
            const { userID, roomListener } = response;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            navigate(`/room/${roomCode}`);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <form className="landing" onSubmit={createRoom}>
            <Link to="/" style={{display: "flex", justifyContent: "center", flexDirection: "row"}}>
                <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            </Link>
            <TextField variant="outlined" label="Enter a Name" required
                value={name}
                onChange={changeName}
                error={error}
                helperText={getNameHelperText(name)} />
            {errorMessage !== null && <ErrorMessage error={errorMessage} />}
            <div className="button-row">
                <Button variant="contained" disabled={error} type="submit" sx={{ marginTop: "1rem" }}
                    startIcon={creating ? <CircularProgress size={20} color="inherit" /> : null}
                >{creating ? "Creating" : "Create"} Room</Button>
            </div>
        </form>
    );
};

export default CreateRoom;
