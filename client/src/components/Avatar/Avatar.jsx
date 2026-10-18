import propTypes from "prop-types";
import classes from "./Avatar.module.css";

// Initials on a colour picked from the name, so every tutor gets a stable,
// distinct avatar without an image host (via.placeholder.com is gone).
const PALETTE = [
   "#635bff",
   "#057a55",
   "#b45309",
   "#c81e1e",
   "#1a56db",
   "#7e3af2",
   "#bf125d",
   "#036672",
];

const initials = (name = "") =>
   name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

const colourFor = (name = "") => {
   let hash = 0;
   for (const char of name) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
   return PALETTE[hash % PALETTE.length];
};

const Avatar = ({ name, size = "md" }) => (
   <span
      className={`${classes.avatar} ${classes[size]}`}
      style={{ backgroundColor: colourFor(name) }}
      role="img"
      aria-label={name}
   >
      {initials(name)}
   </span>
);

Avatar.propTypes = {
   name: propTypes.string,
   size: propTypes.oneOf(["sm", "md", "lg"]),
};

export default Avatar;
