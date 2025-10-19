export function createPageUrl(pageName: string): string {
  const routes: Record<string, string> = {
    'Chat': '/',
    'Procedures': '/procedures',
    'Users': '/users'
  };
  
  return routes[pageName] || '/';
}
