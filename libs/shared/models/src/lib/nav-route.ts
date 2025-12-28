export interface NavRoute {
  path: string;
  title: string;
  children?: NavRoute[];
}
