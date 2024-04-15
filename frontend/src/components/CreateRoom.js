import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import { randomName, validateName, getNameHelperText } from "../data/util.js";
import { errorCodes, makeRoom, joinRoom } from "../data/firebase.js";
import "../styles.css";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(randomName());
    const error = !validateName(name);
    const changeName = (e) => {
        setName(e.target.value);
    }
    const createRoom = async () => {
        if (error) {
            return;
        }
        try {
            let response = await makeRoom();
            if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error)
                return;
            }
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
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener }));
            navigate(`/room/${roomCode}`);
        } catch(err) {
            console.error(err);
        }


    };
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name"
                value={name}
                onChange={changeName}
                error={error}
                helperText={getNameHelperText(name)} />
            <div className="button-row">
                <Button variant="contained" disabled={error}
                    onClick={createRoom} sx={{ marginTop: "1rem" }}>Create Room</Button>
            </div>
        </div>
    );
};

export default CreateRoom;
