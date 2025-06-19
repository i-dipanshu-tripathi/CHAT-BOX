import { useState } from "react";
import Search from "./search";
import UsersList from "./userList";

function Sidebar({ socket, onlineUser }) {
  const [searchKey, setSearchKey] = useState("");

  return (
    <div className="app-sidebar">
      {/* SEARCH USER */}
      <Search searchKey={searchKey} setSearchKey={setSearchKey} />
      {/* USER LIST */}
      <UsersList
        searchKey={searchKey}
        socket={socket}
        onlineUser={onlineUser}
      />
    </div>
  );
}

export default Sidebar;
