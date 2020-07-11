import { Subject } from "rxjs";

const subjects = {};

export const subject = (name) => {
  if (subjects[name]) {
    return subjects[name];
  }

  subjects[name] = new Subject();

  return subjects[name];
};
