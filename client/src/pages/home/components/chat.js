import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from "moment";
import { clearUnreadMessageCount } from "../../../apiCalls/chat";
import store from "./../../../redux/store";
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }) {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector(
    (state) => state.userReducer
  );
  const selectedUser = selectedChat.members.find((u) => u._id !== user._id);
  const [message, setMessage] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const sendMessage = async (image) => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        sender: user._id,
        text: message,
        image: image,
      };

      socket.emit("send-message", {
        ...newMessage,
        members: selectedChat.members.map((m) => m._id),
        read: false,
        createdAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      });

      const response = await createNewMessage(newMessage);

      if (response.success) {
        setMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatTime = (timestamp) => {
    const now = moment();
    const diff = now.diff(moment(timestamp), "days");

    if (diff < 1) {
      return `Today ${moment(timestamp).format("hh:mm A")}`;
    } else if (diff === 1) {
      return `Yesterday ${moment(timestamp).format("hh:mm A")}`;
    } else {
      return moment(timestamp).format("MMM D,hh:mm A");
    }
  };

  const getMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());
      if (response.success) {
        setAllMessage(response.data);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      socket.emit("clear-unread-messages", {
        chatId: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
      });
      const response = await clearUnreadMessageCount(selectedChat._id);
      console.log(response);
      if (response.success) {
        allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data;
          }

          return chat;
        });
      }
    } catch (error) {
      toast.error(error.message);
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

  const sendImage = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      sendMessage(reader.result);
    };
  };

  useEffect(() => {
    if (!selectedChat || !user) return;

    getMessages();

    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    const handleReceiveMessage = (data) => {
      const activeChat = store?.getState()?.userReducer?.selectedChat;
      if (activeChat?._id === data?.chatId) {
        setAllMessage((prevmsg) => [...prevmsg, data]);
      }

      if (selectedChat._id === data.chatId && data.sender !== user._id) {
        clearUnreadMessageCount();
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    socket.on("message-count-cleared", (data) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      const allChats = store.getState().userReducer.allChats;
      // UPDATING UNREAD MESSAGES COUNT IN CHAT OBJECT
      if (selectedChat._id === data.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === data.chatId) {
            return { ...chat, unreadMessageCount: 0 };
          }
          return chat;
        });

        dispatch(setAllChats(updatedChats));

        // UPDATING READ PROPERTY IN MESSAGE OBJECT
        setAllMessage((prevMsgs) => {
          return prevMsgs.map((msg) => {
            return { ...msg, read: true };
          });
        });
      }
    });

    socket.on("started-typing", (data) => {
      if (selectedChat._id === data.chatId && data.sender != user._id) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    // Cleanup to avoid duplicate listeners
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [selectedChat, user]);

  useEffect(() => {
    const msgContainer = document.getElementById("main-chat-area");
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessage, isTyping]);

  return (
    <>
      {selectedChat && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">
            {/* RECEIVER DATA */}
            {formatName(selectedUser)}
          </div>
          <div className="main-chat-area" id="main-chat-area">
            {Array.isArray(allMessage) &&
              allMessage.map((msg) => {
                const isCurrentUserSender = msg.sender === user._id;
                return (
                  <div
                    className="message-container"
                    style={
                      isCurrentUserSender
                        ? { justifyContent: "end" }
                        : { justifyContent: "start" }
                    }
                  >
                    <div>
                      <div
                        className={
                          isCurrentUserSender
                            ? "send-message"
                            : "received-message"
                        }
                      >
                        <div>{msg.text}</div>
                        <div>
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="image"
                              height="120"
                              width="120"
                            ></img>
                          )}
                        </div>
                      </div>
                      <div
                        className="message-timestamp"
                        style={
                          isCurrentUserSender
                            ? { float: "right" }
                            : { float: "left" }
                        }
                      >
                        {formatTime(msg.createdAt)}{" "}
                        {isCurrentUserSender && msg.read && (
                          <i
                            className="fa fa-check-circle"
                            aria-hidden="true"
                            style={{ color: "#e74c3c" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div className="typing-indicator">
              {isTyping && <i>typing....</i>}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              padding: "0px 20px",
              justifyContent: "right",
            }}
          >
            {showEmojiPicker && (
              <EmojiPicker
                style={{ width: "300px", height: "400px" }}
                onEmojiClick={(e) => setMessage(message + e.emoji)}
              ></EmojiPicker>
            )}
          </div>
          <div className="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a Message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                socket.emit("user-typing", {
                  chatId: selectedChat._id,
                  members: selectedChat.members.map((m) => m._id),
                  sender: user._id,
                });
              }}
            />
            <label for="file">
              <i className="fa fa-picture-o send-image-btn"></i>
              <input
                type="file"
                id="file"
                style={{ display: "none" }}
                accept="image/jpg,image/png,image/jpeg,image/gif"
                onChange={sendImage}
              ></input>
            </label>
            <button
              className="fa fa-smile-o send-emoji-btn "
              aria-hidden="true"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
              }}
            />
            <button
              className="fa fa-paper-plane send-message-btn"
              aria-hidden="true"
              onClick={() => sendMessage("")}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatArea;
