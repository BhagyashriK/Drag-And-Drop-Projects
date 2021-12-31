import ProjectInput from "./components/project-input";
import ProjectList from "./components/project-list";
import { Status } from "./models/project";

new ProjectInput();
new ProjectList(Status.Active);
new ProjectList(Status.Finised);
