interface MockUser {
    email: string;
    password: string;
    name: string;
  }
  
  const mockUsers: MockUser[] = [
    { email: 'admin1@school.com', password: '123', name: 'Admin 1' },
    { email: 'omar@school.com', password: '123', name: 'Omar' },
    { email: 'mohamed@school.com', password: '123', name: 'Mohamed' }
  ];
  
  export const mockAuth = {
    login: (email: string, password: string) => {
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('mockUser', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    logout: () => localStorage.removeItem('mockUser'),
    getCurrentUser: () => {
      const user = localStorage.getItem('mockUser');
      return user ? JSON.parse(user) : null;
    }
  };