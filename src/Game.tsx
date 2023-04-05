import { HubConnection } from "@microsoft/signalr";
import { FC, useCallback, useEffect, useState } from "react";
import "./css/gameStyles.css";

export interface GameInterface {
    group: string;
    username: string;
    connection: HubConnection | undefined;
    setInLobby: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Game: FC<GameInterface> = ({
    group,
    username,
    connection,
    setInLobby,
}) => {
    const [winner, setWinner] = useState("playing");
    const [isUsersTurn, setIsUsersTurn] = useState(group !== username);
    const [textValue, setTextValue] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [gameState, setGameState] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
    ]);

    const isGameOver = useCallback(
        (gameState: string[]) => {
            var arrays = [
                [gameState[0], gameState[1], gameState[2]],
                [gameState[3], gameState[4], gameState[5]],
                [gameState[6], gameState[7], gameState[8]],
                [gameState[0], gameState[3], gameState[6]],
                [gameState[1], gameState[4], gameState[7]],
                [gameState[2], gameState[5], gameState[8]],
                [gameState[0], gameState[4], gameState[8]],
                [gameState[2], gameState[4], gameState[6]],
            ];
            var obj = arrays.map((a) =>
                a[0] === a[1] && a[1] === a[2] && a[0] !== ""
                    ? a[0] === "x"
                        ? "x"
                        : "o"
                    : ""
            );
            if (obj.includes("x")) {
                setWinner(username === group ? "them" : "you");
                return true;
            }
            if (obj.includes("o")) {
                setWinner(username === group ? "you" : "them");
                return true;
            }
            if (!gameState.includes("")) {
                setWinner("draw");
                return true;
            }
            return false;
        },
        [group, username]
    );

    const onReceiveMove = useCallback(
        (user: string, move: number) => {
            const newGameState = gameState;
            newGameState[move] = user === group ? "o" : "x";
            setGameState([...newGameState]);
            var over = isGameOver(gameState);
            setIsUsersTurn(user !== username && !over);
        },
        [gameState, group, isGameOver, username]
    );

    const onReceiveMessage = useCallback(
        (message: string) => {
            setMessages([...messages, message]);
        },
        [messages]
    );

    const onSquareClick = async (position: number) => {
        if (connection && isUsersTurn && gameState[position] === "") {
            setIsUsersTurn(false);
            await connection.send("SendGameMove", group, username, position);
        }
    };

    const onSendClick = async () => {
        if (connection && textValue !== "") {
            await connection.send(
                "SendGameChatMessage",
                group,
                username,
                textValue
            );
        }
        setTextValue("");
    };

    const returnToLobby = async () => {
        if (connection) {
            await connection.send("LeaveGame", group, username);
            setInLobby(true);
        }
    };

    const renderWinner = useCallback(() => {
        switch (winner) {
            case "":
                return "";
            case "draw":
                return "It's a draw!";
            case "you":
                return "You won!";
            case "them":
                return "You lost";
        }
    }, [winner]);

    useEffect(() => {
        if (connection) {
            connection.on("GameMove", onReceiveMove);
            connection.on("GameChatMessage", onReceiveMessage);
        }
    }, [connection, onReceiveMessage, onReceiveMove]);

    return (
        <div>
            <div className="arena">
                <div className="board">
                    <div className="row">
                        <div
                            className="square"
                            onClick={() => onSquareClick(0)}
                        >
                            {gameState[0]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(3)}
                        >
                            {gameState[3]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(6)}
                        >
                            {gameState[6]}
                        </div>
                    </div>
                    <div className="row">
                        <div
                            className="square"
                            onClick={() => onSquareClick(1)}
                        >
                            {gameState[1]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(4)}
                        >
                            {gameState[4]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(7)}
                        >
                            {gameState[7]}
                        </div>
                    </div>
                    <div className="row">
                        <div
                            className="square"
                            onClick={() => onSquareClick(2)}
                        >
                            {gameState[2]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(5)}
                        >
                            {gameState[5]}
                        </div>
                        <div
                            className="square"
                            onClick={() => onSquareClick(8)}
                        >
                            {gameState[8]}
                        </div>
                    </div>
                </div>
                <div>
                    <h2>{renderWinner()}</h2>
                    {winner !== "playing" ? (
                        <button onClick={returnToLobby}>Return to lobby</button>
                    ) : null}
                </div>
            </div>
            <div className="chat">
                <div>
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
    );
};
