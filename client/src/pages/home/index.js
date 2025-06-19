import Header from "./components/header";
import Sidebar from "./components/sidebar";
import ChatArea from "./components/chat";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
const socket = io("https://chat-box-client.onrender.com");

function Home() {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUser, setOnlineUser] = useState([]);
  useEffect(() => {
    if (user) {
      socket.emit("join-room", user?._id);
      socket.emit("user-login", user?._id);
      socket.on("online-users", (onlineUsers) => {
        setOnlineUser(onlineUsers);
      });

      socket.on("online-users-updated", (onlineUser) => {
        setOnlineUser(onlineUser);
      });
    }
  }, [user]);

  return (
    <div className="home-page">
      <Header socket={socket} />
      <div className="main-content">
        <Sidebar socket={socket} onlineUser={onlineUser} />
        {/* CHAT AREA LAYOUT */}
        {selectedChat && <ChatArea socket={socket} />}
      </div>
    </div>
  );
}

export default Home;
