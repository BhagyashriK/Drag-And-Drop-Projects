/// <reference path="models/project.ts" />
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-input.ts" />
namespace App {
  new ProjectInput();
  new ProjectList(Status.Active);
  new ProjectList(Status.Finised);
}
