import { Button } from "antd";
import { child, get, getDatabase, ref } from "firebase/database";
import { useNavigate } from "react-router-dom";
import {
  anonymousLogin,
  editStatus,
  googleLogin,
  logout,
  storeUserData,
} from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      style={{
        margin: "2rem",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {user ? (
        <Button
          type="primary"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </Button>
      ) : (
        <div>
          <Button
            type="primary"
            onClick={async () => {
              const { user } = await googleLogin();

              const database = getDatabase();
              const dbRef = ref(database);
              const dbUser = await get(child(dbRef, `users/${user.uid}`));

              if (dbUser.exists()) {
                navigate("/dash");
              } else {
                await storeUserData({
                  userId: user.uid,
                  email: user.email,
                  name: user.displayName,
                  imageUrl: user.photoURL,
                });

                console.log("here i am here");
                await editStatus({
                  userId: user.uid,
                });

                navigate("/dash");
              }
            }}
          >
            Google Login
          </Button>
          <span style={{ margin: "1rem" }}></span>
          <Button
            type="primary"
            onClick={async () => {
              const { user } = await anonymousLogin();
              const res = await fetch("https://randomuser.me/api/");
              const respData = await res.json();
              const data = respData.results[0];

              const userStoredData = {
                userId: user.uid,
                email: data.email,
                name: `${data.name.first} ${data.name.last}`,
                imageUrl: data.picture.thumbnail,
              };
              await storeUserData(userStoredData);
              await editStatus({
                userId: user.uid,
              });
              navigate("/dash");
            }}
          >
            Ananymous Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default Header;
