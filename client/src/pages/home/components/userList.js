import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createNewChat } from "../../../apiCalls/chat";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";
import moment from "moment";
import chat from "../components/chat";
import store from "../../../redux/store";
function UsersList({ searchKey, socket, onlineUser }) {
  const dispatch = useDispatch();
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);

  const openChat = (selectedUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((m) => m._id).includes(currentUser._id) &&
        chat.members.map((m) => m._id).includes(selectedUserId)
    );

    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const isSelectedChat = (user) => {
    if (selectedChat) {
      return selectedChat.members.map((m) => m._id).includes(user._id);
    }
    return false;
  };

  const startNewChat = async (searchUserId) => {
    try {
      dispatch(showLoader());
      const response = await createNewChat([currentUser._id, searchUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
      }
    } catch (error) {
      toast.error(error.message);
      dispatch(hideLoader());
    }
  };

  const getLastMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      const messagePrefix =
        chat?.lastMessage?.sender === currentUser._id ? "You : " : "";
      return messagePrefix + chat?.lastMessage?.text.substring(0, 25);
    }
  };

  const getLastMessageTimestamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    // Fixed condition: was incorrect logic before
    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      return moment(chat?.lastMessage?.createdAt).format("hh:mm A");
    }
  };

  function formatName(user) {
    let fname =
      user?.firstName.at(0).toUpperCase() +
      user?.firstName.slice(1).toLowerCase();
    let lname =
      user?.lastName.at(0).toUpperCase() +
      user?.lastName.slice(1).toLowerCase();

    return fname + " " + lname;
  }

  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (
      chat &&
      chat.unreadMessageCount &&
      chat.lastMessage?.sender !== currentUser._id
    ) {
      return (
        <div className="unread-message-counter">{chat.unreadMessageCount}</div>
      );
    } else {
      return "";
    }
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      let allChats = store.getState().userReducer.allChats;

      if (selectedChat?._id !== message.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
              lastMessage: message,
            };
          }
          return chat;
        });
        allChats = updatedChats;
      }
      // 1.Find the Latest Chat
      const latestChat = allChats.find((chat) => chat._id === message.chatId);
      // 2.Get All Other Chat
      const otherChats = allChats.filter((chat) => chat._id !== message.chatId);
      // 3.Create the new Array with latest chat on top and then all other chats
      allChats = [latestChat, ...otherChats];
      dispatch(setAllChats(allChats));
    });
  }, []);

  // ✅ Fixed logic here
  function getData() {
    if (searchKey === "") {
      // Original:
      // return allChats;

      // Fixed: convert chat.members to user objects
      return allChats
        .map((chat) => chat.members.find((mem) => mem._id !== currentUser._id))
        .filter(Boolean); // remove undefined
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstName?.toLowerCase().includes(searchKey?.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchKey?.toLowerCase())
        );
      });
    }
  }

  return getData().map((user) => {
    // Original:
    // let user = obj;
    // if (obj.members) {
    //   user = obj.members.find((mem) => mem._id !== currentUser._id);
    // }

    return (
      <div
        className="user-search-filter"
        onClick={() => openChat(user._id)}
        key={user._id}
      >
        <div
          className={isSelectedChat(user) ? "selected-user" : "filtered-user"}
        >
          <div className="filter-user-display">
            {user.profilePic && (
              <img
                src={user.profilePic}
                alt="Profile Pic"
                className="user-profile-img"
                style={
                  onlineUser.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              />
            )}
            {!user.profilePic && (
              <div
                className={
                  isSelectedChat(user)
                    ? "user-selected-avatar"
                    : "user-default-avatar"
                }
                style={
                  onlineUser.includes(user._id)
                    ? { border: "#82e0aa 3px solid" }
                    : {}
                }
              >
                {user.firstName.charAt(0).toUpperCase() +
                  user.lastName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="filter-user-details">
              <div className="user-display-name">{formatName(user)}</div>
              <div className="user-display-email">
                {getLastMessage(user._id) || user.email}
              </div>
            </div>

            <div>
              {getUnreadMessageCount(user._id)}
              <div className="last-message-timestamp">
                {getLastMessageTimestamp(user._id)}
              </div>
            </div>
            {!allChats.find((chat) =>
              chat.members.map((m) => m._id).includes(user._id)
            ) && (
              <div className="user-start-chat">
                <button
                  className="user-start-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ prevent click bubbling
                    startNewChat(user._id);
                  }}
                >
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

export default UsersList;
