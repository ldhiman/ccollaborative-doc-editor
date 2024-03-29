import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { authenticateUser } from "../js/auth";
import { acceptCollabRequest } from "../js/doc";

function CollabRequest() {
  const { token } = useParams();
  const [message, setMessage] = useState("Accepting Collab Request...");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const acceptRequest = async () => {
      setLoading(true);
      authenticateUser()
        .then(() => {
          acceptCollabRequest(token)
            .then((res) => {
              setMessage(res.data); // Assuming 'res' is an Axios response object
            })
            .catch((error) => {
              setMessage(error.response.data.message || error.message); // Accessing the 'message' property of the error object
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch((error) => {
          setMessage("please login first"); // Accessing the 'message' property of the error object
          setLoading(false);
        });
    };

    acceptRequest();
  }, [token]);

  return (
    <div>
      {isLoading ? <h2 key="1">Loading...</h2> : <h2 key="2">{message}</h2>}
    </div>
  );
}

export default CollabRequest;
