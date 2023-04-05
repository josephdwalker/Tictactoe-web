import { useState, useEffect } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

export const useSignalRConnection: (
    hubName: string,
    username: string
) => HubConnection | undefined = (hubName, username) => {
    const [connection, setConnection] = useState<HubConnection>();
    const Url = "https://tictactoe-service-api.azurewebsites.net/";

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${Url}${hubName}`)
            .withAutomaticReconnect()
            .build();

        newConnection
            .start()
            .then(() => {
                newConnection.invoke("Register", username);
            })
            .catch((e: any) => console.log("Connection failed: ", e));

        setConnection(newConnection);
    }, [hubName, username]);

    return connection;
};
