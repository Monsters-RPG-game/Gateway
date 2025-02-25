import type { EServices } from '../../../../enums/index.js';

export type IServicesHealth = {
  [key in EServices]: boolean;
};

export interface IHealth extends IServicesHealth {
  alive: number;
}
