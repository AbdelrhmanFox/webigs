module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#4361ee',
            dark: '#3a56d4'
          },
          secondary: {
            DEFAULT: '#3f37c9',
            dark: '#3830b5'
          },
          success: '#4cc9f0',
          danger: '#f72585',
          warning: '#f8961e',
          info: '#4895ef',
          dark: '#1e1e2d',
          light: '#f8f9fa'
        }
      },
    },
    plugins: [],
  }