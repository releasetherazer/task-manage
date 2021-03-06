import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import clsx from "clsx";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ViewHeadlineIcon from "@material-ui/icons/ViewHeadline";
import Projects from "./../Projects";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectsAction,
  getUserTotheProject,
  setProjectUserAction,
} from "../../actions/projectsActions";
import Alert from "@material-ui/lab/Alert";
import { db } from "./../../firebase";
import firebase from "firebase";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(0),
      width: "25ch",
    },
  },
}));
const useStylesSidebar = makeStyles({
  list: {
    width: 350,
  },
  fullList: {
    width: "auto",
  },
});
function SideBar() {
  const classes = useStyles();
  const classesSide = useStylesSidebar();
  const dispatch = useDispatch();
  const projectusuario = useSelector((state) => state.project.projectusertask);
  const userAuth = useSelector((state) => state.users.userAuth);
  // state to work with the component
  const [error, saveError] = useState(false);
  const [uiduser, setUid] = useState("");
  const [project, setProject] = useState({
    name: "",
  });
  const { name } = project;
  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    setUid(userAuth?.uid);
    db.collection("projectos")
      .where("uid", "==", `${userAuth?.uid}`)
      .onSnapshot((snapshot) => {
        dispatch(
          setProjectUserAction(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              project: doc.data(),
            }))
          )
        );
      });
  }, [userAuth, dispatch]);
  useEffect(() => {
    dispatch(getUserTotheProject(userAuth));
    db.collection("projectos")
      .orderBy("created", "desc")
      .onSnapshot((snapshot) => {
        dispatch(
          getProjectsAction(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              project: doc.data(),
            }))
          )
        );
      });
  }, [dispatch, userAuth]);

  const handleSubmmit = (e) => {
    e.preventDefault();
    if (name === "") {
      saveError(true);
      return;
    }
    saveError(false);
    db.collection("projectos").add({
      created: firebase.firestore.FieldValue.serverTimestamp(),
      name: name,
      uid: uiduser,
    });
    setProject({ name: "" });
  };

  // code to add a project into our database with firebase

  const [state, setState] = useState({
    left: false,
  });
  function visibleInput() {
    let inputInfo = document.getElementById("inputProject");
    if (inputInfo.style.visibility === "visible") {
      inputInfo.style.visibility = "hidden";
    } else {
      inputInfo.style.visibility = "visible";
    }
  }
  const toggleDrawer = (anchor, open) => (event) => {
    saveError(false);
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <div
      className={clsx(classesSide.list, {
        [classesSide.fullList]: anchor === "top" || anchor === "bottom",
      })}
      role="presentation"
      // onClick={toggleDrawer(anchor, false)}
    >
      <List>
        <div className="sidebar">
          <div className="sidebar__title">
            <h2>
              <strong>Task</strong>
              <p>Manage</p>
            </h2>
          </div>
          <div className="sidebar__button">
            <button
              className="sidebar__buttoncss"
              onClick={() => visibleInput()}
            >
              New Project
            </button>
            {error ? (
              <Alert
                style={{ width: "14rem", marginBottom: "1rem" }}
                severity="error"
              >
                Ups, You must type a Project Name
              </Alert>
            ) : null}

            <form
              onSubmit={handleSubmmit}
              className={classes.root}
              noValidate
              autoComplete="off"
            >
              <div className="InputProyect" id="inputProject">
                <TextField
                  id="outlined-basic"
                  label="Project Name"
                  variant="outlined"
                  className="sidebar__input"
                  name="name"
                  value={name}
                  onChange={handleChange}
                />
                <button className="sidebar__buttoncss">Add Project</button>
              </div>
            </form>
            {/* <Divider /> */}
            <div className="sidebar__info">
              <h2>Your Projects</h2>
              {projectusuario.map(({ id, project }) => (
                <>
                  <div>
                    <Projects key={id} projectId={id} project={project} />
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </List>

      <List></List>
    </div>
  );

  return (
    <div className="div__contenedornav">
      {["left"].map((anchor) => (
        <React.Fragment key={anchor}>
          <div className="sidebar__menu">
            <ViewHeadlineIcon
              className="button__navi"
              onClick={toggleDrawer(anchor, true)}
              style={{
                width: "2rem",
                height: "2rem",
                color: "white",
              }}
            >
              {anchor}
            </ViewHeadlineIcon>
          </div>

          <Drawer
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}
          >
            {list(anchor)}
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}

export default SideBar;
