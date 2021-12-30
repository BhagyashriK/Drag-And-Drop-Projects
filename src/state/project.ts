import { Project, Status } from "../models/project.js";

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListerner(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// Project state management
export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      Status.Active
    );
    this.projects.push(newProject);

    this.updateListener();
  }

  moveProject(id: string, status: Status) {
    const project = this.projects.find((proj) => proj.id === id);
    if (project && project.status !== status) {
      project.status = status;
      this.updateListener();
    }
  }
  private updateListener() {
    this.listeners.forEach((listener) => {
      listener([...this.projects]);
    });
  }
}

export const state = ProjectState.getInstance();
