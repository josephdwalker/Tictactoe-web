import { FC, useCallback, useState } from "react";
import { Lobby } from "./Lobby";
import "./css/appStyles.css";

export const App: FC = () => {
    const [pageState, setPageState] = useState("login");
    const [username, setUsername] = useState("");

    const onSubmitClick = useCallback(() => {
        if (username !== "") {
            setPageState("lobby");
        }
    }, [username]);

    return pageState === "login" ? (
        <div className="login">
            <div>Username:</div>
            <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmitClick();
                }}
            />
            <button onClick={onSubmitClick}>Enter</button>
        </div>
    ) : (
        <Lobby username={username} />
    );
};
