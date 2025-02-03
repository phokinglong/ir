import React, { useEffect, useState } from "react";
import axios from "axios";

function Protected() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token"); // Get token from localStorage
                const response = await axios.get("http://localhost:5000/protected", {
                    headers: { Authorization: token },
                });
                setMessage(response.data.message);
            } catch (error) {
                setMessage("Access denied");
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>Protected Page</h2>
            <p>{message}</p>
        </div>
    );
}

export default Protected;
