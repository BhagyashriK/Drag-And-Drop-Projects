/// <reference path="drag-and-drop-interfaces.ts" />
/// <reference path="project-models.ts" />

namespace App {
  type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = [];

    addListerner(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  // Project state management
  class ProjectState extends State<Project> {
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

  const state = ProjectState.getInstance();

  //autobind decorator
  function Autobind(
    target: any,
    methodName: string,
    decscriptor: PropertyDescriptor
  ) {
    const orignalMethod = decscriptor.value;
    const newDescriptor: PropertyDescriptor = {
      configurable: true,
      get() {
        const boundFn = orignalMethod.bind(this);
        return boundFn;
      },
    };
    return newDescriptor;
  }

  // Validation
  interface Validate {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  function validate({
    required,
    value,
    minLength,
    maxLength,
    max,
    min,
  }: Validate): boolean {
    let isValid = true;
    if (required) {
      isValid = isValid && value.toString().trim().length > 0;
    }
    if (minLength != null && typeof value === "string") {
      isValid = isValid && value.length >= minLength;
    }
    if (maxLength != null && typeof value === "string") {
      isValid = isValid && value.length <= maxLength;
    }
    if (min != null && typeof value === "number") {
      isValid = isValid && value >= min;
    }
    if (max != null && typeof value === "number") {
      isValid = isValid && value <= max;
    }
    return isValid;
  }

  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;
    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.hostElement = document.getElementById(hostElementId)! as T;
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      this.element = importedNode.firstElementChild as U;
      if (newElementId) {
        this.element.id = newElementId;
      }
      this.attach(insertAtStart);
    }
    private attach(insertAtStart: boolean) {
      this.hostElement.insertAdjacentElement(
        insertAtStart ? "afterbegin" : "beforeend",
        this.element
      );
    }
    abstract configure(): void;
    abstract renderContent(): void;
  }

  class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Dragable
  {
    private project: Project;
    get persons() {
      return this.project.people > 1
        ? `${this.project.people} persons`
        : "1 person";
    }
    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;
      this.configure();
      this.renderContent();
    }
    @Autobind
    dragStartHandler(event: DragEvent): void {
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }
    dragEndHandler(_: DragEvent): void {
      console.log("Drag End");
    }
    configure(): void {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent(): void {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent =
        this.persons + " assigned";
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }

  class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    projects: Project[];

    constructor(private type: Status) {
      super("project-list", "app", false, `${type}-projects`);
      this.projects = [];
      this.configure();
      this.renderContent();
    }

    private renderProjectItem() {
      const ul = document.getElementById(
        `${this.type}-projects-list`
      ) as HTMLUListElement;
      ul.innerHTML = "";
      this.projects.forEach(
        (project) =>
          new ProjectItem(this.element.querySelector("ul")!.id, project)
      );
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
        event.preventDefault();
        const ul: HTMLUListElement = this.element.querySelector("ul")!;
        ul.classList.add("droppable");
      }
    }

    @Autobind
    dropHandler(event: DragEvent): void {
      const projId = event.dataTransfer!.getData("text/plain");
      state.moveProject(
        projId,
        this.type === Status.Active ? Status.Active : Status.Finised
      );
    }
    @Autobind
    dragLeaveHandler(_: DragEvent): void {
      const ul: HTMLUListElement = this.element.querySelector("ul")!;
      ul.classList.remove("droppable");
    }
    configure(): void {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);
      state.addListerner((projects: Project[]) => {
        this.projects = projects.filter(
          (project: Project) => project.status == this.type
        );
        this.renderProjectItem();
      });
    }

    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector(
        "h2"
      )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
  }

  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    // form elements
    titleInput: HTMLInputElement;
    discInput: HTMLInputElement;
    peopleInput: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, `user-input`);
      // Access Inputs
      this.titleInput = this.element.querySelector(
        "#title"
      )! as HTMLInputElement;
      this.discInput = this.element.querySelector(
        "#description"
      )! as HTMLInputElement;
      this.peopleInput = this.element.querySelector(
        "#people"
      )! as HTMLInputElement;

      this.configure();
    }

    configure() {
      this.element.addEventListener("submit", this.onSubmit);
    }
    renderContent(): void {}

    private getInputValues(): [string, string, number] | void {
      const title = this.titleInput.value;
      const description = this.discInput.value;
      const people = this.peopleInput.value;

      const validateTitle: boolean = validate({ value: title, required: true });

      const validateDescription: boolean = validate({
        value: description,
        required: true,
        minLength: 5,
      });

      const validatePeople: boolean = validate({
        value: people,
        required: true,
        min: 1,
        max: 10,
      });

      if (validateTitle && validateDescription && validatePeople) {
        return [title, description, +people];
      }
      alert("Enter valid values");
      return;
    }

    private clearForm() {
      this.titleInput.value = "";
      this.discInput.value = "";
      this.peopleInput.value = "";
    }

    @Autobind
    private onSubmit(event: Event) {
      event.preventDefault();
      const userInput = this.getInputValues();
      if (Array.isArray(userInput)) {
        state.addProject(...userInput);

        this.clearForm();
      }
    }
  }

  new ProjectInput();
  new ProjectList(Status.Active);
  new ProjectList(Status.Finised);
}
