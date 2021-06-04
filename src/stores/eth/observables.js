import { Subject } from 'rxjs';

const subjects = {};
/* eslint-disable import/prefer-default-export */
export const subject = (name) => {
  if (subjects[name]) {
    return subjects[name];
  }

  subjects[name] = new Subject();

  return subjects[name];
};
/* eslint-enable import/prefer-default-export */
