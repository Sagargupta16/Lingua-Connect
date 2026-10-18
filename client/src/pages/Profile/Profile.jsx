import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getStudent } from "../../api/studentApi";
import { deleteSlot, getTutor } from "../../api/tutorApi";
import Avatar from "../../components/Avatar/Avatar";
import Structure from "../../components/Structure/Structure";
import "./Profile.css";
import SlotModal from "./SlotModal";
import TestModal from "./TestModal";

import { useNavigate, useSearchParams } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState({});
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Stripe sends the student back here after paying. The booking itself is
  // made by the webhook, which usually lands before this page loads.
  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;
    toast.success("Payment received. Your class is booked.");
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const id = decodedToken.id;
      setRole(decodedToken.role);
      const response =
        decodedToken.role === "student"
          ? await getStudent(id)
          : await getTutor(id);
      setUser(response.data);
    };

    fetchUser();
  }, []);

  const slotDeleteHandler = async (id) => {
    const response = await deleteSlot(user._id, id);
    if (response.status === 200) {
      window.location.reload();
    }
  };

  const [testModal, setTestModal] = useState(false);

  const leftComponent = (
    <div className="profile">
      <div className="profile-info">
        <Avatar name={user.name} size="lg" />
        <h2 className="username">{user.name}</h2>
        <p className="email">{user.email}</p>
        <p className="role">{role.toUpperCase()}</p>
        <p className="joined">
          Joined on {new Date(user.createdAt).toDateString()}
        </p>
      </div>
      {role === "tutor" ? (
        <>
          <div className="profile-info">
            <h3>Languages</h3>
            {user.languages?.map((language, index) => {
              return <p key={index}>{language}</p>;
            })}
          </div>
          <div className="buttons">
            <button className="btn" onClick={() => setShowModal(true)}>
              Add Slot
            </button>
            <button className="btn" onClick={() => setTestModal(true)}>
              Add Test
            </button>
          </div>
        </>
      ) : null}
    </div>
  );

  const onClickHandler = (id) => {
    navigate(`/room/${id}`);
  };

  const rightComponent = (
    <div className="profile-right">
      <div className="profile-right-top">
        <span className="logo-badge">Upcoming Classes</span>
        <div className="upcoming-classes">
          {user.classes && user.classes.length !== 0 ? (
            user.classes.map((course, index) => {
              return (
                <div key={index} className="upcoming-class">
                  <h3>
                    <span>{course.language}</span>
                  </h3>
                  <p>{new Date(course.startTime).toDateString()}</p>
                  <span>
                    {new Date(course.startTime).toLocaleTimeString(
                      navigator.language,
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                  <p>₹{course.price}</p>
                  <p>{course.duration} minutes</p>
                  <button onClick={() => onClickHandler(course.videoId)}>
                    Join
                  </button>
                </div>
              );
            })
          ) : (
            <div className="no-cards">No upcoming classes</div>
          )}
        </div>
      </div>
      <div className="profile-right-top">
        <span className="logo-badge">Upcoming Tests</span>
        <div className="upcoming-classes">
          {user.tests && user.tests.length !== 0 ? (
            user.tests.map((test, index) => {
              return (
                <div key={index} className="upcoming-class">
                  <h3>{test.name}</h3>
                  <p>{test.language}</p>
                  <p>{test.level}</p>
                  <button>Start</button>
                </div>
              );
            })
          ) : (
            <div className="no-cards">No upcoming tests</div>
          )}
        </div>
      </div>
      {role === "tutor" ? (
        <div className="profile-right-top">
          <span className="logo-badge">Available Slots</span>
          <div className="upcoming-classes">
            {user.slotsAvailability && user.slotsAvailability.length !== 0 ? (
              user.slotsAvailability.map((slot, index) => {
                return (
                  <div key={index} className="upcoming-class">
                    <h3>{new Date(slot.date).toDateString()}</h3>
                    <p>{new Date(slot.startTime).toLocaleTimeString()}</p>
                    <p>{slot.duration} minutes</p>
                    <p>₹{slot.price}</p>
                    <button onClick={() => slotDeleteHandler(slot._id)}>
                      Delete
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="no-cards">No available slots</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container">
      <Structure
        LeftCompnonet={leftComponent}
        RightComponent={rightComponent}
        ContainerComponent={null}
      />
      <SlotModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        id={user._id}
        languages={user.languages}
      />
      <TestModal
        isOpen={testModal}
        onClose={() => setTestModal(false)}
        id={user._id}
        languages={user.languages}
      />
    </div>
  );
};

export default Profile;
