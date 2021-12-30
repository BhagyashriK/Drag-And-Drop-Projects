/// <reference path="base-component.ts" />
/// <reference path="../models/drag-and-drop.ts" />
/// <reference path="../state/project.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="project-item.ts" />

namespace App {
  export class ProjectList
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
}
