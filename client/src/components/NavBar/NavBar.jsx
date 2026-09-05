import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaHome, FaSignInAlt } from "react-icons/fa";
import { MdClass } from "react-icons/md";
import { PiSignOutBold } from "react-icons/pi";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { checkToken } from "../../api/tokenCheckApi";
import Modal from "../Modal/Modal";
import classes from "./Navbar.module.css";
import { TbCards } from "react-icons/tb";

const NavBar = () => {
  const [navItems, setNavItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (token) {
      try {
        checkToken().then((response) => {
          if (response.data.isAuthenticated) {
            setIsAuthenticated(true);
            setRole(jwtDecode(token).role);
            console.log(jwtDecode(token).role);
          } else setIsAuthenticated(false);
        });
      } catch (error) {
        localStorage.removeItem("token");
        console.error("Error checking token:", error);
        setIsAuthenticated(false);
      }
    } else setIsAuthenticated(false);
  }, [token]);

  useEffect(() => {
    const fixedItems = [
      {
        to: "/",
        label: "Home",
        icon: <FaHome />,
      },
    ];
    if (isAuthenticated && role === "student") {
      setNavItems([
        ...fixedItems,
        {
          to: "profile",
          label: "Profile",
          icon: <CgProfile />,
        },
        {
          to: "tutor",
          label: "Tutor",
          icon: <MdClass />,
        },
        {
          to: "flashcards",
          label: "Flashcards",
          icon: <TbCards />,
        },
      ]);
    } else if (isAuthenticated && role === "tutor") {
      setNavItems([
        ...fixedItems,
        {
          to: "profile",
          label: "Profile",
          icon: <CgProfile />,
        },
      ]);
    } else {
      setNavItems([
        ...fixedItems,
        {
          to: "auth?mode=signin",
          label: "Auth",
          icon: <FaSignInAlt />,
        },
      ]);
    }
  }, [isAuthenticated, role]);

  const onSignOutClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onConfirmSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
    closeModal();
  };

  return (
    <>
      <nav className={classes.nav}>
        <NavLink to="/" aria-label="Home" className={classes["nav__logo"]}>
          <span className={classes["logo-badge"]}>Lingua</span>
          Connect
        </NavLink>
        <div className={classes["nav__list"]}>
          {navItems.map((item) => (
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
              aria-label={item.label}
              key={item.to}
            >
              {item.icon}
            </NavLink>
          ))}
          {isAuthenticated && (
            <button
              className={classes["nav__signout"]}
              aria-label="Sign Out"
              onClick={onSignOutClick}
            >
              <PiSignOutBold />
            </button>
          )}
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            onConfirm={onConfirmSignOut}
            message="Are you sure you want to sign out?"
            buttonTitle="Sign Out"
          />
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default NavBar;
