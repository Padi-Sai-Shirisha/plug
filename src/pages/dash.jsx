import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";

import {
  getDatabase,
  ref,
  child,
  get,
  onValue,
  update,
} from "firebase/database";
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Typography,
} from "antd";
import { editStatus } from "../config/firebase";

const dbRef = ref(getDatabase());

const { Title, Text } = Typography;

const success = (text) => {
  message.success(text);
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    isError: false,
    message: "",
  });
  const [statusText, setStatusText] = useState(null);
  const [dashboardContent, setDashboardContent] = useState(null);

  useEffect(() => {
    let userData = {};

    get(child(dbRef, `users/${user.uid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          userData = snapshot.val();
        }
        return get(child(dbRef, `status/${user.uid}`));
      })
      .then((status) => {
        if (status.exists()) {
          userData.status = status.val();
        }
        setUserData(userData);
        setStatusText(userData.status.statusText);
      })
      .catch((error) => {
        console.error(error);
        setError({
          isError: true,
          message: error.message,
        });
      });

    setLoading(false);
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "/users");

    const userseUnsub = onValue(
      usersRef,
      async (snapshot) => {
        const values = [];
        const promises = [];

        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          const obj = {
            id: childKey,
            ...childData,
          };
          if (obj.id !== user.uid) {
            values.push(obj);
            promises.push(get(child(dbRef, `status/${obj.id}`)));
          }
        });

        const statusDataSnapshots = await Promise.all(promises);

        let status = [];
        statusDataSnapshots.forEach((statusSnapshot) => {
          if (statusSnapshot.exists()) {
            status.push(statusSnapshot.val());
          }
        });

        values.forEach((value, index) => {
          value.status = status[index];
        });

        values.sort((a, b) => b.status.likeCount - a.status.likeCount);

        setDashboardContent(values);
      },
      {}
    );

    return () => {
      userseUnsub();
    };
  }, []);

  const handleLike = async ({ likedBy, likedId }) => {
    console.log("inside handleLink");
    // let initialLike = { count: 0 };

    // // optimistic update
    // if (dashboardContent && dashboardContent.length > 0) {
    //   const item = dashboardContent.find((item) => item.id === likedId);
    //   const index = dashboardContent.indexOf(item);
    //   console.log(index);
    //   initialLike.count = item.status.likeCount;
    //   const newState = [...dashboardContent];

    //   console.log(item);
    //   console.log(!Object.keys(item.status.likes).includes(user.uid));

    //   if (Object.keys(item.status.likes).includes(user.uid)) {
    //     console.log("will remove like");
    //     newState[index].status.likeCount = item.status.likeCount - 1;
    //     delete newState[index].status.likes[likedBy];
    //   } else {
    //     console.log("will add like");
    //     newState[index].status.likeCount = item.status.likeCount + 1;
    //     newState[index].status.likes = {
    //       ...item.status.likes,
    //       [likedBy]: true,
    //     };
    //   }

    //   setDashboardContent(newState);
    // }

    const db = getDatabase();
    const dbRef = ref(db);

    get(child(dbRef, `status/${likedId}`))
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          if (data.likes && Object.keys(data.likes).includes(user.uid)) {
            const likes = data.likes;
            delete likes[user.uid];
            const updates = {};
            updates["/status/" + likedId] = {
              ...data,
              likeCount: data.likeCount - 1,
              likes: {
                ...likes,
              },
            };
            await update(ref(db), updates);
            console.log("unliked");
            return;
          }

          console.log("here");
          const updates = {};
          updates["/status/" + likedId] = {
            ...data,
            likeCount: data.likeCount + 1,
            likes: {
              ...data.likes,
              [likedBy]: true,
            },
          };
          await update(ref(db), updates);
          console.log("liked");
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDislike = async ({ disLikedBy, disLikedId }) => {
    const db = getDatabase();
    const dbRef = ref(db);

    get(child(dbRef, `status/${disLikedId}`))
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          if (data.disLikes && Object.keys(data.disLikes).includes(user.uid)) {
            const disLikes = data.disLikes;
            delete disLikes[user.uid];
            const updates = {};
            updates["/status/" + disLikedId] = {
              ...data,
              disLikeCount: data.disLikeCount - 1,
              disLikes: {
                ...disLikes,
              },
            };
            await update(ref(db), updates);
            console.log("un disliked");
            return;
          }

          const updates = {};
          updates["/status/" + disLikedId] = {
            ...data,
            disLikeCount: data.disLikeCount + 1,
            disLikes: {
              ...data.disLikes,
              [disLikedBy]: true,
            },
          };
          await update(ref(db), updates);
          console.log("disliked");
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  if (error.isError) {
    return <div>Something went wrong: {error.message}</div>;
  }

  if (loading) return null;

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      <Row gutter={[36, 36]}>
        <Col span={18}>
          <Row gutter={[16, 16]}>
            {dashboardContent && dashboardContent.length > 0
              ? dashboardContent.map((item) => (
                  <Col span={12} key={item.id}>
                    <Card
                      actions={[
                        <div
                          key="like"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onClick={() =>
                            handleLike({
                              likedId: item.id,
                              likedBy: user.uid,
                            })
                          }
                        >
                          <span style={{ margin: "0 1rem" }}>
                            {item.status.likeCount}
                          </span>
                          <LikeOutlined />,
                        </div>,
                        <div
                          key="dislike"
                          onClick={() => {
                            handleDislike({
                              disLikedId: item.id,
                              disLikedBy: user.uid,
                            });
                          }}
                        >
                          <span style={{ margin: "0 1rem" }}>
                            {item.status.disLikeCount}
                          </span>
                          <DislikeOutlined />
                        </div>,
                      ]}
                    >
                      <Card.Meta
                        avatar={
                          <Avatar size="large" src={item.profile_picture} />
                        }
                        title={item.username}
                        description={item.status.statusText}
                      />
                    </Card>
                  </Col>
                ))
              : null}
          </Row>
        </Col>
        <Col span={6}>
          <Avatar
            size={64}
            icon={<img src={userData?.profile_picture} alt={user?.username} />}
          />
          <Title>{userData?.username}</Title>
          <Text type="secondary">{userData?.email}</Text>
          <div style={{ margin: "1rem 0 0 0" }}>
            <label
              style={{
                marginBottom: "0.25rem",
                display: "block",
              }}
              htmlFor="status"
            >
              Your Status
            </label>
            <Input
              id="status"
              placeholder="Basic usage"
              value={statusText}
              onChange={(e) => {
                setStatusText(e.target.value);
              }}
            />
          </div>
          <Button
            onClick={async () => {
              if (userData.status.statusText === statusText.trim()) {
                return;
              }

              await editStatus({
                userId: user.uid,
                statusText: statusText.trim(),
              });
              success("Status updated");
            }}
            type="primary"
            style={{ margin: "1rem 0" }}
          >
            Submit
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
