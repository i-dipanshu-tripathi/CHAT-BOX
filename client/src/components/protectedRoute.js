import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getLoggedUser } from "../apiCalls/user";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { setAllChats, setAllUsers, setUser } from "../redux/userSlice";
import toast from "react-hot-toast";
import { getAllChats } from "../apiCalls/chat";

function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getLoggedInUser = async () => {
    try {
      dispatch(showLoader());
      const response = await getLoggedUser();
      if (response.success) {
        dispatch(setUser(response.data));
        dispatch(hideLoader());
      } else {
        toast.error(response.message);
        navigate("/login");
        dispatch(hideLoader());
      }
    } catch (error) {
      dispatch(hideLoader());
      navigate("/login");
    }
  };

  const getAllUsersDB = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllUsers();
      if (response.success) {
        dispatch(setAllUsers(response.data));
        dispatch(hideLoader());
      } else {
        toast.error(response.message);
        navigate("/login");
        dispatch(hideLoader());
      }
    } catch (error) {
      dispatch(hideLoader());
      navigate("/login");
    }
  };

  const getCurrentUserChats = async () => {
    try {
      const response = await getAllChats();
      if (response.success) {
        dispatch(setAllChats(response.data));
      }
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // write the logic to get the details of the current user
      getLoggedInUser();
      getAllUsersDB();
      getCurrentUserChats();
    } else {
      console.log("i am here");
      navigate("/login");
    }
  }, []);

  return <div>{children}</div>;
}

export default ProtectedRoute;
