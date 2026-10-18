import { useState } from "react";
import ReactDOM from "react-dom";
import Avatar from "../../components/Avatar/Avatar";
import Stripe from "./Stripe";
import "./TutorModal.css";

const TutorModal = ({ isOpen, onClose, tutor }) => {
  const [pending, setPending] = useState(null);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatTime = (date) => {
    const d = new Date(date);

    return `${d.getHours() > 12 ? d.getHours() - 12 : d.getHours()}:${d.getMinutes().toString().padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  };

  // Only ids go to the server: it prices the booking from its own records,
  // and the Stripe webhook creates the class once the payment succeeds.
  const onhandleBook = async (bookIn, book) => {
    setPending(book._id);
    const purchase =
      bookIn === "slot"
        ? { tutorId: tutor._id, slotId: book._id }
        : { classId: book._id };
    const session = await Stripe(purchase);
    if (!session) setPending(null);
  };

  return ReactDOM.createPortal(
    <>
      {isOpen ? (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <div className="tutor__image__name">
                <Avatar name={tutor.name} size="lg" />
                <h3 className="tutor__name">{tutor.name}</h3>
              </div>
              <div className="tutor__details">
                <div className="modal__tutor__languages">
                  {tutor.languages.map((language, index) => {
                    return <span key={index}>{language}</span>;
                  })}
                </div>
                <div className="tutor__experience">
                  <p>Experience: {tutor.yearsOfExperience} years</p>
                </div>
              </div>
            </div>

            <div className="modal__body">
              <div className="upcoming_classes">
                <span className="logo-badge">Upcoming Classes</span>
                <div className="upcoming_classes__list">
                  <div className="upcoming_class">
                    {tutor.classes.map((cls, index) => {
                      return (
                        <div className="upcoming__card" key={index}>
                          <div className="upcoming__details">
                            <div className="upcoming__info">
                              <h3 className="upcoming__name">{cls.language}</h3>

                              <p>Class Date: {formatDate(cls.startTime)}</p>
                              <p>Class Time: {formatTime(cls.startTime)}</p>
                              <p>Duration: {cls.duration} minutes</p>
                            </div>
                            <div className="upcoming__actions">
                              <button
                                className="btn"
                                disabled={pending !== null}
                                onClick={() => onhandleBook("class", cls)}
                              >
                                {pending === cls._id ? "Redirecting..." : "Book"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="available-slots">
                <span className="logo-badge">Available Slots</span>
                <div className="slots__list">
                  <div className="slot">
                    {tutor.slotsAvailability.map((slot, index) => {
                      return (
                        <div className="slot__card" key={index}>
                          <div className="slot__details">
                            <div className="slot__info">
                              <h3 className="slot__name">
                                {formatDate(slot.date)}
                              </h3>
                              <p>Start Time: {formatTime(slot.startTime)}</p>
                              <p>Duration: {slot.duration} minutes</p>
                              <p>Price: ₹{slot.price}</p>
                              <p>Language: {slot.language}</p>
                            </div>
                            <div className="slot__actions">
                              <button
                                className="btn"
                                disabled={pending !== null}
                                onClick={() => onhandleBook("slot", slot)}
                              >
                                {pending === slot._id ? "Redirecting..." : "Book"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="modal__close"
              aria-label="Close"
              onClick={onClose}
            >
              <span>&times;</span>
            </button>
          </div>
        </div>
      ) : null}
    </>,
    document.getElementById("modal-root"),
  );
};

export default TutorModal;
