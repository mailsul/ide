/** Extract a path param that Express 5 types as string | string[] */
export function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}
