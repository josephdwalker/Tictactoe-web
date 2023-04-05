import { FC, useCallback, useEffect, useState } from "react";
import { Game } from "./Game";
import { useSignalRConnection } from "./useSignalRConnection";
import "./css/lobbyStyles.css";

export interface LobbyProps {
    username: string;
}

export const Lobby: FC<LobbyProps> = ({ username }) => {
    const [inLobby, setInLobby] = useState(true);
    const [textValue, setTextValue] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [group, setGroup] = useState("");
    const [OpponentsUsernames, setOpponentsUsernames] = useState<string[]>([]);
    const connection = useSignalRConnection("/MessageHub", username);

    const onCreateGame = async () => {
        setInLobby(false);
        setGroup(username);
        if (connection) {
            await connection.send("CreateGame", username);
        }
    };

    const onJoinGame = async (opponentUsername: string) => {
        setInLobby(false);
        setGroup(opponentUsername);
        if (connection) {
            await connection.send("JoinGame", opponentUsername, username);
        }
    };

    const onUpdateOpponents = useCallback((opponents: string[]) => {
        setOpponentsUsernames(opponents);
    }, []);

    const onSendClick = async () => {
        if (connection && textValue !== "") {
            await connection.send("SendChatMessage", username, textValue);
        }
        setTextValue("");
    };

    const onReceiveMessage = useCallback(
        (message: string) => {
            setMessages([...messages, message]);
        },
        [messages]
    );

    useEffect(() => {
        if (connection) {
            connection.on("AvailableGames", onUpdateOpponents);
            connection.on("LobbyChatMessage", onReceiveMessage);
        }
    }, [connection, username, onReceiveMessage, onUpdateOpponents]);

    return inLobby ? (
        <div className="lobby">
            <div className="gameArea">
                <button onClick={onCreateGame}>Create Game</button>
                <h2>Available games</h2>
                {OpponentsUsernames.map((opponentUsername) => (
                    <button
                        key={opponentUsername}
                        onClick={() => onJoinGame(opponentUsername)}
                    >
                        {opponentUsername}
                    </button>
                ))}
            </div>
            <div className="chat">
                <div className="messageBox">
                    <input
                        type="text"
                        value={textValue}
                        onChange={(event) => {
                            setTextValue(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") onSendClick();
                        }}
                    />
                    <button onClick={onSendClick}>Send</button>
                </div>
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={index}>{message}</div>
                    ))}
                </div>
            </div>
        </div>
    ) : (
        <Game
            group={group}
            username={username}
            connection={connection}
            setInLobby={setInLobby}
        />
    );
};
