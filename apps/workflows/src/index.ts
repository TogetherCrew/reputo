export function helloWorld(name?: string): string {
  return `Hello ${name || 'world'}!`;
}
