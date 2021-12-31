// Types

export enum Status {
  Active = "active",
  Finised = "finished",
}

export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: Status
  ) {}
}
