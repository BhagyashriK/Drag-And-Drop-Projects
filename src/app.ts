import ProjectInput from "./components/project-input.js";
import ProjectList from "./components/project-list.js";
import { Status } from "./models/project.js";

new ProjectInput();
new ProjectList(Status.Active);
new ProjectList(Status.Finised);
