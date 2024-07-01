// import type { ISingleSkillEntity } from '../singleSkill/entity';

export interface ISingleSkillEntity {
  _id: string;
  singleSkillId: string;
}

export interface ISkillsEntity {
  _id: string;
  owner: string;
  skills: ISingleSkillEntity[];
}
