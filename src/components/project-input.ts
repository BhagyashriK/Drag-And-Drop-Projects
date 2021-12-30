/// <reference path="base-component.ts" />
/// <reference path="../utils/validation.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project.ts" />

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
