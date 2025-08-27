import React from "react";
import {
  MdLogout,
  MdAssignment,
  MdDoneAll,
  MdPeople,
} from "react-icons/md";

function AdminSidebar({ active = "Completed", setActive, open, setOpen }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const itemClass = (label) =>
    `flex items-center gap-3 px-4 py-2 cursor-pointer transition rounded-lg ${
      label === active
        ? "bg-[#2F2240] text-white font-semibold shadow"
        : "hover:bg-[#eceaf6] text-[#3d3356]"
    }`;

  return (
    <>
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen  bg-opacity-[0.04] text-[#3d3356] flex flex-col justify-between py-6 transition-all duration-300 ${
          open
            ? "w-64 bg-[#ecebee] bg-opacity-[100]"
            : "w-0 bg-[#2F2240] overflow-hidden bg-opacity-[0.04]"
        } md:w-64`}
        style={{ minWidth: open ? "18rem" : "0" }}
      >
        <div>
          <div className="text-2xl font-bold px-6 mb-8 tracking-wide text-[#2F2240]">
            <a href="/">AUTOCONNECT</a>
          </div>

          <nav className="space-y-1 px-6">
            <div
              className={itemClass("Completed")}
              onClick={() => {
                setActive("Completed");
                setOpen(false);
              }}
            >
              <MdDoneAll size={20} />
              <span>Completed</span>
            </div>
            <div
              className={itemClass("Transactions")}
              onClick={() => {
                setActive("Transactions");
                setOpen(false);
              }}
            >
              <MdAssignment size={20} />
              <span>Transactions</span>
            </div>
            <div
              className={itemClass("Users")}
              onClick={() => {
                setActive("Users");
                setOpen(false);
              }}
            >
              <MdPeople size={20} />
              <span>Users</span>
            </div>

            <hr className="my-5 border-[#2F2240] mx-6 mt-10" />
          </nav>
        </div>

        <button
          className="bg-[#2F2240] hover:bg-[#3d3356] text-white mx-6 py-3 rounded-lg flex justify-center items-center gap-2 font-semibold text-base transition mb-2"
          onClick={handleLogout}
        >
          <MdLogout size={20} />
          Logout
        </button>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default AdminSidebar;