import propTypes from "prop-types";
import { useState } from "react";
import "./Filter.css";

const Filter = ({ Allptions, optionClickHandler }) => {
  // On phones the filter list starts collapsed so the tutors are on screen;
  // the heading toggles it. Desktop CSS always shows the list.
  const [open, setOpen] = useState(false);

  const optionsRenderer = (head, options) => {
    return (
      <div key={head} className="filter__item">
        <div className="filter__item__label">{head}</div>
        <div className="filter__item__values">
          {options.map((option) => (
            <button
              key={option.value}
              id={`${head.toLowerCase()}-${option.value}`}
              className="filter__item__value"
              onClick={() => optionClickHandler(head, option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`filter${open ? " filter--open" : ""}`}>
      <h3>
        <button
          type="button"
          className="filter__toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Filters
        </button>
      </h3>
      <div className="filter__items">
        {Object.keys(Allptions).map((key) =>
          optionsRenderer(key, Allptions[key]),
        )}
      </div>
    </div>
  );
};

Filter.propTypes = {
  Allptions: propTypes.object.isRequired,
  optionClickHandler: propTypes.func.isRequired,
};

export default Filter;
