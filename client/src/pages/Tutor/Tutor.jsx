import { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { getTutors } from "../../api/tutorApi";
import Avatar from "../../components/Avatar/Avatar";
import Filter from "../../components/Filter/Filter";
import Structure from "../../components/Structure/Structure";
import "./Tutor.css";

import TutorModal from "./TutorModal";

const Tutor = () => {
  // const randomNames = [
  //   "Alice",
  //   "Bob",
  //   "Charlie",
  //   "David",
  //   "Emma",
  //   "Frank",
  //   "Grace",
  //   "Henry",
  //   "Ivy",
  //   "Jack",
  //   "Katie",
  //   "Liam",
  //   "Mia",
  //   "Noah",
  //   "Olivia",
  //   "Peter",
  //   "Quinn",
  //   "Rachel",
  //   "Sam",
  //   "Taylor",
  //   "Uma",
  //   "Victor",
  //   "Wendy",
  //   "Xander",
  //   "Yasmine",
  //   "Zack",
  // ];
  // const randomLanguages = [
  //   "English",
  //   "Spanish",
  //   "French",
  //   "German",
  //   "Italian",
  //   "Chinese",
  //   "Japanese",
  //   "Russian",
  //   "Arabic",
  //   "Portuguese",
  //   "Korean",
  //   "Dutch",
  // ];

  // // Generate random name
  // function generateRandomName() {
  //   return randomNames[Math.floor(Math.random() * randomNames.length)];
  // }

  // // Generate random list of languages
  // function generateRandomLanguages() {
  //   const numLanguages =
  //     Math.floor(Math.random() * (randomLanguages.length - 1)) + 1; // Random number of languages between 1 and the length of randomLanguages
  //   const shuffledLanguages = randomLanguages.sort(() => Math.random() - 0.5); // Shuffle the languages array
  //   return shuffledLanguages.slice(0, numLanguages); // Return a slice of shuffled languages array
  // }

  const [tutors, setTutors] = useState([]);
  const [allTutors, setAllTutors] = useState([]);
  const [currentTutor, setCurrentTutor] = useState(null);

  // for (let i = 1; i <= 10; i++) {
  //   tutors.push({
  //     image: `https://via.placeholder.com/100?text=Tutor${i}`,
  //     name: generateRandomName(),
  //     languages: generateRandomLanguages(),
  //     yearsOfExperience: Math.floor(Math.random() * 10) + 1, // Random experience between 1 and 10
  //     rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1 and 5
  //   });
  // }

  useEffect(() => {
    getTutors().then((tutors) => setTutors(tutors.data));
  }, []);

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Italian", label: "Italian" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Russian", label: "Russian" },
    { value: "Arabic", label: "Arabic" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Korean", label: "Korean" },
    { value: "Dutch", label: "Dutch" },
  ];

  const experienceOptions = [
    { value: 1, label: ">= 1 year" },
    { value: 2, label: ">= 2 years" },
    { value: 3, label: ">= 3 years" },
    { value: 5, label: ">= 5 years" },
    { value: 10, label: "10+ years" },
  ];

  const priceOptions = [
    { value: 500, label: "<=₹500" },
    { value: 1000, label: "<=₹1000" },
    { value: 1500, label: "<=₹1500" },
    { value: 2000, label: "<=₹2000" },
    { value: 2500, label: "<=₹2500" },
    { value: 3000, label: "<=₹3000" },
    { value: 3500, label: "<=₹3500" },
    { value: 4000, label: "<=₹4000" },
    { value: 4500, label: "<=₹4500" },
    { value: 5000, label: "<=₹5000" },
  ];

  const Allptions = {
    Language: languageOptions,
    Experience: experienceOptions,
    Price: priceOptions,
  };

  const [language, setLanguage] = useState([]);
  const [experience, setExperience] = useState([]);
  const [price, setPrice] = useState([]);

  const checkLanguage = (value) => {
    if (language.length === 0) return true;
    return language.every((lang) => value.includes(lang));
  };

  const checkExperience = (value) => {
    if (experience.length === 0) return true;
    if (experience.includes(10)) return value >= 10;
    else if (experience.includes(5)) return value >= 5;
    else if (experience.includes(3)) return value >= 3;
    else if (experience.includes(2)) return value >= 2;
    else if (experience.includes(1)) return value >= 1;
  };

  const checkPrice = (value) => {
    if (price.length === 0) return true;
    if (price.includes(5000)) return value <= 5000;
    else if (price.includes(4500)) return value <= 4500;
    else if (price.includes(4000)) return value <= 4000;
    else if (price.includes(3500)) return value <= 3500;
    else if (price.includes(3000)) return value <= 3000;
    else if (price.includes(2500)) return value <= 2500;
    else if (price.includes(2000)) return value <= 2000;
    else if (price.includes(1500)) return value <= 1500;
    else if (price.includes(1000)) return value <= 1000;
    else if (price.includes(500)) return value <= 500;
  };

  const optionClickHandler = (head, value) => {
    const element = document.getElementById(`${head.toLowerCase()}-${value}`);
    element.classList.add("active");

    const stateUpdater = {
      Language: setLanguage,
      Experience: setExperience,
      Price: setPrice,
    };

    stateUpdater[head]((prevState) => {
      const isValueIncluded = prevState.includes(value);
      if (isValueIncluded) {
        element.classList.remove("active");
        return prevState.filter((option) => option !== value);
      }
      return [...prevState, value];
    });
  };

  const leftComponent = (
    <Filter Allptions={Allptions} optionClickHandler={optionClickHandler} />
  );

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Tutors have no single price; filter on their cheapest open slot.
  const cheapestSlot = (tutor) =>
    tutor.slotsAvailability.length === 0
      ? undefined
      : Math.min(...tutor.slotsAvailability.map((slot) => slot.price));

  // Stored ratings are 0 to 5; clamp so a bad value cannot break the stars.
  const stars = (rating) => Math.min(5, Math.max(0, Math.round(rating || 0)));

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rightComponent = (
    <div className="tutor-container">
      <input
        type="text"
        placeholder="Search Tutor"
        className="search-tutor"
        onChange={handleSearch}
      />
      <div className="tutor-list">
        {filteredTutors.length !== 0 &&
          filteredTutors.map((tutor, index) => {
            if (
              !checkLanguage(tutor.languages) ||
              !checkExperience(tutor.yearsOfExperience) ||
              !checkPrice(cheapestSlot(tutor))
            ) {
              return null;
            }
            return (
              <div className="tutor-card" key={index}>
                <div className="tutor__details">
                  <div className="tutor__image">
                    <Avatar name={tutor.name} />
                  </div>
                  <div className="tutor__info">
                    <h3 className="tutor__name">{tutor.name}</h3>
                    <div className="tutor__languages">
                      {tutor.languages.map((language, index) => {
                        return <span key={index}>{language}</span>;
                      })}
                    </div>
                    <div className="tutor__experience">
                      <p>Experience: {tutor.yearsOfExperience} years</p>
                    </div>
                    <p className="tutor__price">
                      {cheapestSlot(tutor) === undefined
                        ? "No open slots"
                        : `From ₹${cheapestSlot(tutor)}`}
                    </p>
                  </div>
                </div>
                <div className="tutor__actions">
                  <div className="tutor__rating">
                    {[...Array(stars(tutor.rating))].map((star, index) => {
                      return (
                        <AiFillStar key={index} style={{ color: "gold" }} />
                      );
                    })}
                    {[...Array(5 - stars(tutor.rating))].map((star, index) => {
                      return (
                        <AiFillStar key={index} style={{ color: "black" }} />
                      );
                    })}
                  </div>
                  <button
                    className="btn"
                    onClick={() => setCurrentTutor(tutor)}>
                    {" "}
                    View Profile{" "}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      <TutorModal
        isOpen={currentTutor}
        onClose={() => setCurrentTutor(null)}
        tutor={currentTutor}
      />
    </div>
  );

  return (
    <div className="container">
      <Structure
        LeftCompnonet={leftComponent}
        RightComponent={rightComponent}
        ContainerComponent={null}
      />
    </div>
  );
};

export default Tutor;
